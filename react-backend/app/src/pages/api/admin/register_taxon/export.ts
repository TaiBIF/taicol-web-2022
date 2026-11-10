import { Register_taxon } from 'src/db/models/register_taxon';
import type { NextApiRequest, NextApiResponse } from 'next/types';

// 匯出用：一次回傳全部資料，不分頁
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const rows = await Register_taxon.findAll({
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  res.status(200).json(rows);
};
