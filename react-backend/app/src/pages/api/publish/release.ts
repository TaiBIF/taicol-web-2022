/**
 * 版本名錄發佈 API（TaiCOL 更新服務呼叫，Step 10）
 *
 * POST /api/publish/release
 *   Authorization: Bearer <RELEASE_PUBLISH_TOKEN>（app/.env）
 *   multipart：month（YYYY-MM）、name_count、taxon_count、taiwan_species_count，
 *              檔案 name、taxon、namecode（檔名 TaiCOL_<kind>_YYYYMMDD.zip）
 *
 * 月份與日期取自檔名（TaiCOL_<kind>_YYYYMMDD.zip，三個檔名的日期要相同）：month 必須等於檔名的年月；
 * publishedDate＝檔名的日期＋發佈當下的時間（台北時間），三筆依序各差 1 秒（新增順序同 2026-08）。
 *
 * 1. 這個月份已有任一筆下載紀錄，或 public/upload 已有同名檔 → 409，不覆蓋、不新增
 * 2. 三個檔案存到 public/upload（與後台手動上傳同一個目錄、同樣用原檔名）
 * 3. 同一個 transaction 新增三筆 downloads（publish=1、publishedDate=現在）與 download_files
 * 失敗時刪掉這次存的檔案。
 *
 * 不放在 /api/admin 底下：認證方式不同（token，不是登入）。
 * 網站前面的 Traefik 只允許更新服務的內部 IP 呼叫 /api/publish（production.yml／staging.yml）。
 */
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { promises as fs, constants as fsConstants } from 'fs';
import path from 'path';
import crypto from 'crypto';
import formidable, { Fields, Files, File } from 'formidable';
import { Op } from 'sequelize';
import sequelize from 'src/db/index';
import { Download, DownloadFile } from 'src/db/models/download';

export const config = {
  api: {
    bodyParser: false,
  },
};

type Kind = 'name' | 'taxon' | 'namecode';

// 新增順序與 2026-08（downloads id 149、151、152）相同；文字照當時的格式
const KINDS: Kind[] = ['name', 'taxon', 'namecode'];
const CATEGORY: Record<Kind, number> = { name: 6, taxon: 7, namecode: 5 };

const titles = (month: string): Record<Kind, { title: string; title_eng: string }> => ({
  name: { title: `學名檔案${month}`, title_eng: `Name Checklist ${month}` },
  taxon: { title: `物種檔案${month}`, title_eng: `Taxon Checklist ${month}` },
  namecode: { title: `新舊學名編碼對照${month}`, title_eng: `New/Old TaiCOL Namecode Matching List ${month}` },
});

type Counts = { name_count: number; taxon_count: number; taiwan_species_count: number };

const descriptions = (c: Counts): Record<Kind, { description: string; description_eng: string }> => ({
  name: { description: `共 ${c.name_count} 筆`, description_eng: `total ${c.name_count} records` },
  taxon: {
    description: `共 ${c.taxon_count} 筆（${c.taiwan_species_count} 種）`,
    description_eng: `total ${c.taxon_count} records (${c.taiwan_species_count} species)`,
  },
  namecode: { description: '舊版臺灣物種名錄學名編碼對照新版學名編碼', description_eng: 'name_code vs. Name ID' },
});

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const fileNameRe = (kind: Kind) => new RegExp(`^TaiCOL_${kind}_(\\d{8})\\.zip$`);
const TAIPEI_OFFSET_MS = 8 * 3600 * 1000;

/** 檔名日期 YYYYMMDD ＋ 現在的台北時間（時分秒）＋ offsetSec 秒；日期不合法回 null */
function publishedDateFor(yyyymmdd: string, offsetSec: number): Date | null {
  const [y, m, d] = [+yyyymmdd.slice(0, 4), +yyyymmdd.slice(4, 6), +yyyymmdd.slice(6, 8)];
  const day = new Date(Date.UTC(y, m - 1, d));
  if (day.getUTCFullYear() !== y || day.getUTCMonth() !== m - 1 || day.getUTCDate() !== d) return null;
  const now = new Date(Date.now() + TAIPEI_OFFSET_MS); // 用 UTC 欄位讀出的就是台北時間
  const ms = Date.UTC(y, m - 1, d, now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()) - TAIPEI_OFFSET_MS;
  return new Date(ms + offsetSec * 1000);
}
const MAX_FILE_SIZE = 200 * 1024 * 1024;

const json = (res: NextApiResponse, status: number, body: object) => res.status(status).json(body);

function authorized(req: NextApiRequest): boolean {
  const token = process.env.RELEASE_PUBLISH_TOKEN || '';
  if (token.length < 32) return false; // 沒設定 token 時一律拒絕
  const given = Buffer.from(String(req.headers.authorization || ''));
  const expected = Buffer.from(`Bearer ${token}`);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
  const form = formidable({ maxFileSize: MAX_FILE_SIZE, maxFiles: 3, multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

const one = <T>(v: T | T[] | undefined): T | undefined => (Array.isArray(v) ? v[0] : v);

function count(fields: Fields, key: keyof Counts): number | null {
  const v = String(one(fields[key]) ?? '');
  return /^\d+$/.test(v) ? parseInt(v, 10) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return json(res, 405, { status: false, error: 'method not allowed' });
  if (!authorized(req)) return json(res, 401, { status: false, error: 'unauthorized' });

  let parsed: { fields: Fields; files: Files };
  try {
    parsed = await parseForm(req);
  } catch (e) {
    console.log('[publish] 解析上傳失敗', e);
    return json(res, 400, { status: false, error: 'invalid multipart body' });
  }
  const { fields, files } = parsed;
  const uploaded: File[] = Object.values(files).flatMap((f) => (Array.isArray(f) ? f : [f]));
  const cleanupTemp = () => Promise.all(uploaded.map((f) => fs.rm(f.filepath, { force: true })));

  try {
    const month = String(one(fields.month) ?? '');
    const counts = {
      name_count: count(fields, 'name_count'),
      taxon_count: count(fields, 'taxon_count'),
      taiwan_species_count: count(fields, 'taiwan_species_count'),
    };
    if (!MONTH_RE.test(month)) return json(res, 400, { status: false, error: 'month 要是 YYYY-MM' });
    if (Object.values(counts).some((v) => v === null))
      return json(res, 400, { status: false, error: 'name_count、taxon_count、taiwan_species_count 要是非負整數' });

    const byKind = {} as Record<Kind, File>;
    for (const kind of KINDS) {
      const f = one(files[kind]);
      if (!f || !f.originalFilename || !fileNameRe(kind).test(f.originalFilename))
        return json(res, 400, { status: false, error: `${kind} 檔案缺少或檔名不是 TaiCOL_${kind}_YYYYMMDD.zip` });
      byKind[kind] = f;
    }
    const dates = KINDS.map((k) => (fileNameRe(k).exec(byKind[k].originalFilename as string) as RegExpExecArray)[1]);
    if (new Set(dates).size !== 1) return json(res, 400, { status: false, error: '三個檔名的日期不同' });
    const fileDate = dates[0];
    if (month !== `${fileDate.slice(0, 4)}-${fileDate.slice(4, 6)}`)
      return json(res, 400, { status: false, error: `month（${month}）與檔名日期（${fileDate}）不符` });
    if (!publishedDateFor(fileDate, 0)) return json(res, 400, { status: false, error: `檔名日期不合法：${fileDate}` });

    const t = titles(month);
    const exists = await Download.findOne({
      where: { [Op.or]: KINDS.map((k) => ({ CategoryId: CATEGORY[k], title_eng: t[k].title_eng })) },
    });
    if (exists) return json(res, 409, { status: false, error: `${month} 已有下載紀錄（id ${exists.id}）` });

    const uploadDir = path.join(process.cwd(), 'public', 'upload');
    await fs.mkdir(uploadDir, { recursive: true });
    const saved: string[] = [];
    try {
      for (const kind of KINDS) {
        const dest = path.join(uploadDir, byKind[kind].originalFilename as string);
        await fs.copyFile(byKind[kind].filepath, dest, fsConstants.COPYFILE_EXCL); // 已有同名檔就失敗
        saved.push(dest);
      }
    } catch (e: any) {
      await Promise.all(saved.map((p) => fs.rm(p, { force: true })));
      if (e && e.code === 'EEXIST') return json(res, 409, { status: false, error: '已有同名檔案，未覆蓋' });
      throw e;
    }

    const d = descriptions(counts as Counts);
    const domain = process.env.NEXT_PUBLIC_DOMAIN;
    const tx = await sequelize.transaction();
    try {
      const created = [];
      for (const [i, kind] of KINDS.entries()) {
        const row = await Download.create(
          {
            CategoryId: CATEGORY[kind],
            ...t[kind],
            ...d[kind],
            publish: true,
            publishedDate: publishedDateFor(fileDate, i),
            DownloadFiles: [{ type: 'csv', url: `${domain}/upload/${byKind[kind].originalFilename}` }],
          },
          { include: [DownloadFile], transaction: tx }
        );
        created.push({ id: row.id, kind, title: t[kind].title });
      }
      await tx.commit();
      console.log('[publish] 已發佈', month, created);
      return json(res, 201, { status: true, month, downloads: created });
    } catch (e) {
      await tx.rollback();
      await Promise.all(saved.map((p) => fs.rm(p, { force: true })));
      throw e;
    }
  } catch (e) {
    console.log('[publish] 發佈失敗', e);
    return json(res, 500, { status: false, error: 'publish failed' });
  } finally {
    await cleanupTemp();
  }
}
