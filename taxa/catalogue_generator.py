# -*- coding: utf-8 -*-
"""
物種名錄產生器
- 只產出有效名（status:accepted），以物種（taxon）為單位，多對應只取第一筆
- 自由選擇匯出欄位，產出 Word / Excel
- 資料來源沿用 catalogue 搜尋條件（get_conditioned_solr_search 回傳的 query_list）
"""
import io
import html as html_lib
import re

import numpy as np
import pandas as pd
import requests

from conf.settings import SOLR_PREFIX
from taxa.utils import (
    rank_map, rank_map_c, rank_order_map,
    attr_map, attr_map_c,
    cites_map, protected_map_c, protected_map,
)

from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

import openpyxl
from openpyxl.cell.rich_text import CellRichText, TextBlock
from openpyxl.cell.text import InlineFont
from openpyxl.styles import Font


# ---------------------------------------------------------------------------
# 階層設定：key, rank_id, 拉丁欄位, 中文欄位, 中文rank標籤, 英文rank標籤, 是否斜體
# ---------------------------------------------------------------------------
HIER_LEVELS = [
    ('kingdom', 3,  'kingdom', 'kingdom_c', '界', 'Kingdom', False),
    ('phylum',  12, 'phylum',  'phylum_c',  '門', 'Phylum',  False),
    ('class',   18, 'class',   'class_c',   '綱', 'Class',   False),
    ('order',   22, 'order',   'order_c',   '目', 'Order',   False),
    ('family',  26, 'family',  'family_c',  '科', 'Family',  False),
    ('genus',   30, 'genus',   'genus_c',   '屬', 'Genus',   True),
]
HIER_BY_KEY = {h[0]: h for h in HIER_LEVELS}

SPECIES_LABEL_C = '種'
SPECIES_LABEL_EN = 'Species'
INFRA_LABEL_C = '種下'
INFRA_LABEL_EN = 'Infraspecific'
SPECIES_RANK_ID = 34

# 林奈主階層 rank_id（界門綱目科屬）
LINNAEAN_MAIN_RANK_IDS = [h[1] for h in HIER_LEVELS]
# 種下（infraspecific）rank_id
INFRASPECIFIC_RANK_IDS = list(range(35, 47))  # 35..46
# 種 + 種下（統計「種」時計算的範圍）
SPECIES_AND_BELOW_RANK_IDS = {SPECIES_RANK_ID} | set(INFRASPECIFIC_RANK_IDS)
# 名錄中允許出現的 rank：林奈主階層 + 種 + 種下（其餘亞階層不列入）
CHECKLIST_RANK_IDS = set(LINNAEAN_MAIN_RANK_IDS) | SPECIES_AND_BELOW_RANK_IDS

# 括號 / 欄位中屬性顯示順序（species 用）
ATTR_ORDER = ['alien', 'endemic', 'protected', 'redlist', 'iucn', 'cites', 'habitat']

ATTR_HEADER_C = {
    'alien': '原生/外來性', 'endemic': '特有性', 'protected': '保育類',
    'redlist': '臺灣紅皮書', 'iucn': 'IUCN', 'cites': 'CITES', 'habitat': '棲地環境',
}
ATTR_HEADER_EN = {
    'alien': 'Native/Alien', 'endemic': 'Endemic', 'protected': 'Protected',
    'redlist': 'Redlist', 'iucn': 'IUCN', 'cites': 'CITES', 'habitat': 'Habitat',
}

HABITAT_COLS = [
    ('is_terrestrial', 'is_terrestrial'),
    ('is_freshwater', 'is_freshwater'),
    ('is_brackish', 'is_brackish'),
    ('is_marine', 'is_marine'),
]


# ---------------------------------------------------------------------------
# 取資料：只取有效名、以 taxon 為單位、多對應只取第一筆
# ---------------------------------------------------------------------------
def _count_taxa(query_list):
    """回傳符合搜尋條件的 taxon 數量。"""
    query = {
        "query": "*:*", "limit": 0, "filter": query_list,
        "facet": {"taxon_id": {'type': 'terms', 'field': 'taxon_id', 'mincount': 1,
                               'limit': 0, 'numBuckets': True}},
    }
    resp = requests.post(f'{SOLR_PREFIX}taxa/select?', data=__import__('json').dumps(query),
                         headers={'content-type': 'application/json'}).json()
    if not resp['response']['numFound']:
        return 0
    return resp['facets']['taxon_id']['numBuckets']


def count_catalogue_taxa(query_list):
    return _count_taxa(query_list)


def get_catalogue_df(query_list):
    """
    依搜尋條件取得符合的 taxon_id，再抓每個 taxon 的有效名（accepted）資料。
    回傳一個 taxon 一列的 DataFrame。
    """
    import json as _json

    # 1. 先用 facet 取得所有符合條件的 taxon_id（去重）
    taxon_ids = []
    offset = 0
    page = 1000
    while True:
        query = {
            "query": "*:*", "limit": 0, "filter": query_list,
            "facet": {"taxon_id": {'type': 'terms', 'field': 'taxon_id', 'mincount': 1,
                                   'limit': page, 'offset': offset, 'sort': 'index',
                                   'numBuckets': True}},
        }
        resp = requests.post(f'{SOLR_PREFIX}taxa/select?', data=_json.dumps(query),
                             headers={'content-type': 'application/json'}).json()
        if not resp['response']['numFound']:
            break
        buckets = resp['facets']['taxon_id']['buckets']
        taxon_ids += [b['val'] for b in buckets]
        total = resp['facets']['taxon_id']['numBuckets']
        offset += page
        if offset >= total or not buckets:
            break
    return get_catalogue_df_by_taxon_ids(taxon_ids)


def get_catalogue_df_by_taxon_ids(taxon_ids):
    """
    給定 taxon_id 清單，抓每個 taxon 的有效名（accepted）資料，只保留物種階層。
    catalogue 搜尋與學名比對兩頁共用。
    """
    import json as _json
    taxon_ids = [t for t in dict.fromkeys(taxon_ids) if t]
    if not taxon_ids:
        return pd.DataFrame()

    # 分批抓每個 taxon 的有效名資料
    docs = []
    fl = ('taxon_id,rank_id,formatted_accepted_name,simple_name,name_author,common_name_c,'
          'is_endemic,alien_type,is_terrestrial,is_freshwater,is_brackish,is_marine,'
          'cites,iucn,redlist,protected,'
          'kingdom,kingdom_c,phylum,phylum_c,class,class_c,order,order_c,'
          'family,family_c,genus,genus_c')
    batch = 500
    for i in range(0, len(taxon_ids), batch):
        chunk = taxon_ids[i:i + batch]
        q = {
            "query": "*:*",
            "filter": [f"taxon_id:({' OR '.join(chunk)})", "status:accepted", "taxon_name_id:*"],
            "fields": fl, "limit": batch,
        }
        resp = requests.post(f'{SOLR_PREFIX}taxa/select?', data=_json.dumps(q),
                             headers={'content-type': 'application/json'}).json()
        docs += resp['response']['docs']

    df = pd.DataFrame(docs)
    if df.empty:
        return df

    df = df.rename(columns={'formatted_accepted_name': 'formatted_name', 'rank_id': 'rank'})

    need_cols = ['taxon_id', 'rank', 'formatted_name', 'simple_name', 'name_author', 'common_name_c',
                 'is_endemic', 'alien_type', 'is_terrestrial', 'is_freshwater',
                 'is_brackish', 'is_marine', 'cites', 'iucn', 'redlist', 'protected',
                 'kingdom', 'kingdom_c', 'phylum', 'phylum_c', 'class', 'class_c',
                 'order', 'order_c', 'family', 'family_c', 'genus', 'genus_c']
    for c in need_cols:
        if c not in df.keys():
            df[c] = ''

    # 多對應只取第一筆（同一 taxon 只留一列）
    df = df.drop_duplicates(subset=['taxon_id']).reset_index(drop=True)

    # 布林轉 true/false 字串
    is_list = ['is_endemic', 'is_terrestrial', 'is_freshwater', 'is_brackish', 'is_marine']
    df[is_list] = df[is_list].replace({0: 'false', 1: 'true', '0': 'false', '1': 'true',
                                       True: 'true', False: 'false'})
    df['rank'] = df['rank'].apply(lambda x: int(str(x).replace('.0', '')) if x != '' and x is not None else '')

    # 只保留林奈主階層（界門綱目科屬種）+ 種下；其餘亞階層不列入名錄
    df = df[df['rank'].apply(lambda x: x in CHECKLIST_RANK_IDS)].reset_index(drop=True)

    df = df.replace({np.nan: '', None: ''})
    return df[need_cols]


# ---------------------------------------------------------------------------
# 欄位選項解析
# ---------------------------------------------------------------------------
def parse_options(req, is_english):
    """
    從 request.POST 解析勾選欄位。回傳 dict。
    checkbox 送出時值為 'on'（未勾選則不存在）。
    """
    def on(key):
        return req.get(key) == 'on' or req.get(key) == 'true' or req.get(key) == '1'

    # 學名擇一（radio）：full / simple，預設 full
    name_type = req.get('col_name_type', 'full')
    if name_type not in ('full', 'simple'):
        name_type = 'full'

    return {
        'full_name': name_type == 'full',
        'simple_name': name_type == 'simple',
        'common_name': on('col_common_name'),
        'attrs': [a for a in ATTR_ORDER if on(f'col_{a}')],
        'hiers': [h[0] for h in HIER_LEVELS if on(f'hier_{h[0]}')],
        'hier_c': on('col_hier_c'),
        'is_english': is_english,
    }


# ---------------------------------------------------------------------------
# 學名 <i> 解析 → [(text, italic_bool), ...]
# ---------------------------------------------------------------------------
_TAG_RE = re.compile(r'(<[^>]+>)')


def parse_formatted_runs(s):
    if s is None:
        return [('', False)]
    runs = []
    italic = 0
    for tok in _TAG_RE.split(str(s)):
        if not tok:
            continue
        low = tok.lower()
        if low in ('<i>', '<em>'):
            italic += 1
        elif low in ('</i>', '</em>'):
            italic = max(0, italic - 1)
        elif tok.startswith('<'):
            continue  # 其他標籤略過
        else:
            text = html_lib.unescape(tok)
            if text:
                runs.append((text, italic > 0))
    return runs or [('', False)]


# ---------------------------------------------------------------------------
# 屬性顯示值（原生/特有/保育…）
# ---------------------------------------------------------------------------
def _is_true(v):
    """接受 True / 'true' / 1 / '1' 等各種真值表示。"""
    return v in (True, 'true', 'True', 1, '1')


def _attr_value(row, attr, is_english):
    amap = attr_map if is_english else attr_map_c
    if attr == 'alien':
        v = row.get('alien_type')
        return amap.get(v, '') if v else ''
    if attr == 'endemic':
        return (attr_map['is_endemic'] if is_english else attr_map_c['is_endemic']) \
            if _is_true(row.get('is_endemic')) else ''
    if attr == 'habitat':
        vals = []
        for col, key in HABITAT_COLS:
            if _is_true(row.get(col)):
                vals.append(amap[key])
        return '/'.join(vals)
    if attr in ('protected', 'redlist', 'iucn', 'cites'):
        return _conserv_value(attr, row.get(attr), is_english)
    return ''


def _conserv_value(attr, raw, is_english):
    """紅皮書/IUCN 只顯示代碼；CITES 顯示 CITES Appendix X；保育類沿用站上中文/英文完整顯示。"""
    if not raw:
        return ''
    parts = [p for p in str(raw).split('/') if p != '']
    if attr in ('redlist', 'iucn'):
        return '/'.join(parts)
    if attr == 'cites':
        apps = [cites_map.get(code, code) for code in parts]
        return 'CITES ' + '/'.join(apps)
    if attr == 'protected':
        out = []
        for code in parts:
            if is_english:
                out.append(protected_map.get(code, code))
            elif code == '1':
                out.append(protected_map_c.get('1', code))
            else:
                label = protected_map_c.get(code, '')
                out.append(f"第 {code} 級 {label}".strip())
        return '/'.join(out)
    return ''


def _species_attrs(row, opts):
    """回傳 [(attr_key, value_str), ...]，只含被勾選且有值的。"""
    out = []
    for a in opts['attrs']:
        v = _attr_value(row, a, opts['is_english'])
        out.append((a, v))
    return out


# ---------------------------------------------------------------------------
# 排序 & 統計
# ---------------------------------------------------------------------------
def sort_and_stats(df, opts):
    """依所選階層由高到低排序，回傳 (sorted_df, stats_list)。"""
    hiers = opts['hiers']  # 已依 HIER_LEVELS 順序

    # 排序鍵：所選階層拉丁名 + 學名
    sort_cols = [HIER_BY_KEY[h][2] for h in hiers] + ['simple_name']
    sort_cols = [c for c in sort_cols if c in df.keys()]
    if sort_cols:
        df = df.sort_values(by=sort_cols, kind='stable', na_position='last').reset_index(drop=True)

    # 統計：固定列出 界門綱目科屬 + 種（不受匯出欄位勾選影響）
    # 某階層在資料中皆為空則不顯示；種永遠顯示。
    stats = []
    for key, rid, lat, cn, lc, le, ital in HIER_LEVELS:
        if lat not in df.keys():
            continue
        n = df[df[lat].astype(str).str.strip() != ''][lat].nunique()
        if n > 0:
            stats.append((lc, le, n))
    # 種：rank=34；種下：rank 35–46（加總，有才顯示）
    if 'rank' in df.keys():
        species_count = int((df['rank'] == SPECIES_RANK_ID).sum())
        infra_count = int(df['rank'].apply(lambda x: x in INFRASPECIFIC_RANK_IDS).sum())
    else:
        species_count, infra_count = len(df), 0
    stats.append((SPECIES_LABEL_C, SPECIES_LABEL_EN, species_count))
    if infra_count > 0:
        stats.append((INFRA_LABEL_C, INFRA_LABEL_EN, infra_count))
    return df, stats


_EN_PLURAL = {
    'Kingdom': 'Kingdoms', 'Phylum': 'Phyla', 'Class': 'Classes', 'Order': 'Orders',
    'Family': 'Families', 'Genus': 'Genera', 'Species': 'Species',
    'Infraspecific': 'Infraspecific taxa',
}


def stats_text(stats, is_english):
    if is_english:
        parts = []
        for lc, le, n in stats:
            label = le if n <= 1 else _EN_PLURAL.get(le, le + 's')
            parts.append(f"{n} {label}")
        return "This catalogue contains " + ", ".join(parts) + "."
    parts = [f"{n}{lc}" for lc, le, n in stats]
    return "本名錄中共有" + "".join(parts) + "。"


# ---------------------------------------------------------------------------
# 名錄列展開：產生 [(type, level_key, data), ...] 供 Word/Excel 共用
# type: 'header' → 階層標題；'species' → 物種列
# ---------------------------------------------------------------------------
def build_rows(df, opts):
    hiers = opts['hiers']
    last_vals = {h: None for h in hiers}
    # 被選為標題的階層對應的 rank_id；若 taxon 本身 rank 落在其中，只當標題不另成列
    header_rank_ids = {HIER_BY_KEY[h][1] for h in hiers}
    rows = []
    for _, r in df.iterrows():
        row = r.to_dict()
        # 檢查每個所選階層是否換值 → 印標題
        changed = False
        for depth, h in enumerate(hiers):
            lat = HIER_BY_KEY[h][2]
            val = str(row.get(lat, '')).strip()
            if changed or val != last_vals[h]:
                changed = True
                last_vals[h] = val
                # 重置更低階層，強制下面重印
                for lower in hiers[depth + 1:]:
                    last_vals[lower] = None
                # 該階層無值則略過標題（不印空縮排行）
                if val:
                    rows.append(('header', h, {'depth': depth, 'row': row}))
        # taxon 本身即某個被選標題階層 → 只當標題，不另成列
        if row.get('rank') in header_rank_ids:
            continue
        rows.append(('species', None, {'depth': len(hiers), 'row': row}))
    return rows


def _header_runs(level_key, row, opts):
    """階層標題的文字 runs：中文名(可選) + 拉丁名(genus 斜體)。"""
    key, rid, lat, cn, lc, le, ital = HIER_BY_KEY[level_key]
    latin = str(row.get(lat, '')).strip()
    cname = str(row.get(cn, '')).strip()
    runs = []
    if opts['hier_c'] and not opts['is_english'] and cname:
        runs.append((cname + ' ', False))
    runs.append((latin, ital))  # genus 斜體，其餘正常
    if opts['hier_c'] and opts['is_english'] and cname:
        # 英文頁若使用者勾了階層中文名，附在後面
        runs.append((' ' + cname, False))
    return runs


def _full_name_runs(row):
    """完整學名：formatted_name 的斜體 runs + author（非斜體）。
    屬（genus）以上（含）階層不帶作者。"""
    runs = list(parse_formatted_runs(row.get('formatted_name')))
    genus_rank_id = HIER_BY_KEY['genus'][1]  # 30
    rank = row.get('rank')
    is_genus_or_above = isinstance(rank, int) and rank <= genus_rank_id
    author = row.get('name_author')
    author = str(author).strip() if author else ''
    if author and not is_genus_or_above:
        runs.append((' ' + author, False))
    return runs


def _species_name_runs(row, opts):
    if opts['full_name']:
        return _full_name_runs(row)
    return [(str(row.get('simple_name', '')), True)]


# ---------------------------------------------------------------------------
# Word
# ---------------------------------------------------------------------------
def build_docx(df, opts):
    doc = Document()
    style = doc.styles['Normal']
    style.font.size = Pt(11)

    df, stats = sort_and_stats(df, opts)
    rows = build_rows(df, opts)

    # 統計
    p = doc.add_paragraph()
    p.add_run(stats_text(stats, opts['is_english'])).bold = True

    indent_unit = '　'  # 全形空白當縮排（也可改用段落縮排）

    for rtype, level_key, data in rows:
        depth = data['depth']
        row = data['row']
        para = doc.add_paragraph()
        prefix = indent_unit * depth
        if prefix:
            para.add_run(prefix)

        if rtype == 'header':
            for text, ital in _header_runs(level_key, row, opts):
                run = para.add_run(text)
                run.bold = True
                run.italic = ital
        else:
            # 學名
            for text, ital in _species_name_runs(row, opts):
                run = para.add_run(text)
                run.italic = ital
            # 中文名
            if opts['common_name'] and str(row.get('common_name_c', '')).strip():
                para.add_run(' ' + str(row['common_name_c']).strip())
            # 括號屬性
            attrs = [v for _, v in _species_attrs(row, opts) if v]
            if attrs:
                para.add_run(' (' + ','.join(attrs) + ')')

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf


# ---------------------------------------------------------------------------
# Excel
# ---------------------------------------------------------------------------
def _rich_from_runs(runs):
    """把 [(text, italic)] 轉成 openpyxl CellRichText；略過空字串 run。"""
    blocks = []
    for text, ital in runs:
        if not text:
            continue
        blocks.append(TextBlock(InlineFont(i=True), text) if ital else TextBlock(InlineFont(), text))
    if not blocks:
        return ''
    return CellRichText(*blocks)


def _preserve_space_xlsx(buf):
    """openpyxl 寫 rich text 的 <t> 未帶 xml:space=preserve，Excel 會吃掉前後空白
    （導致種小名與種下名黏在一起）。存檔後補上 preserve。"""
    import zipfile
    buf.seek(0)
    zin = zipfile.ZipFile(buf, 'r')
    out = io.BytesIO()
    zout = zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED)
    for item in zin.namelist():
        data = zin.read(item)
        if (item.startswith('xl/worksheets/') and item.endswith('.xml')) \
                or item == 'xl/sharedStrings.xml':
            data = data.decode('utf-8').replace('<t>', '<t xml:space="preserve">').encode('utf-8')
        zout.writestr(item, data)
    zout.close()
    zin.close()
    out.seek(0)
    return out


def build_xlsx(df, opts):
    df, stats = sort_and_stats(df, opts)
    rows = build_rows(df, opts)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = '名錄' if not opts['is_english'] else 'Catalogue'

    bold_font = Font(bold=True)

    # 欄位標題
    headers = []
    if opts['full_name']:
        headers.append('完整學名' if not opts['is_english'] else 'Scientific name')
    if opts['simple_name']:
        headers.append('簡單學名' if not opts['is_english'] else 'Simple name')
    if opts['common_name']:
        headers.append('中文名' if not opts['is_english'] else 'Common name')
    attr_hdr_map = ATTR_HEADER_EN if opts['is_english'] else ATTR_HEADER_C
    for a in opts['attrs']:
        headers.append(attr_hdr_map[a])

    r = 1
    # 統計列
    ws.cell(row=r, column=1, value=stats_text(stats, opts['is_english'])).font = bold_font
    r += 1
    # 欄位標題列
    for ci, h in enumerate(headers, start=1):
        ws.cell(row=r, column=ci, value=h).font = bold_font
    r += 1

    for rtype, level_key, data in rows:
        row = data['row']
        if rtype == 'header':
            key, rid, lat, cn, lc, le, ital = HIER_BY_KEY[level_key]
            cell = ws.cell(row=r, column=1)
            hruns = _header_runs(level_key, row, opts)
            if any(i for _, i in hruns):
                cell.value = _rich_from_runs(hruns)
            else:
                cell.value = ''.join(t for t, _ in hruns)
            cell.font = bold_font  # 較高階層粗體
            r += 1
        else:
            ci = 1
            if opts['full_name']:
                ws.cell(row=r, column=ci).value = _rich_from_runs(_full_name_runs(row))
                ci += 1
            if opts['simple_name']:
                ws.cell(row=r, column=ci).value = _rich_from_runs([(str(row.get('simple_name', '')), True)])
                ci += 1
            if opts['common_name']:
                ws.cell(row=r, column=ci, value=str(row.get('common_name_c', '')).strip())
                ci += 1
            for a in opts['attrs']:
                ws.cell(row=r, column=ci, value=_attr_value(row, a, opts['is_english']))
                ci += 1
            r += 1

    ws.column_dimensions['A'].width = 42
    for col in range(2, len(headers) + 2):
        ws.column_dimensions[openpyxl.utils.get_column_letter(col)].width = 16

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return _preserve_space_xlsx(buf)   # 補 xml:space=preserve