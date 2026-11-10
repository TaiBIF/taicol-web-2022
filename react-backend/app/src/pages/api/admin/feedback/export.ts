import { Feedback } from 'src/db/models/feedback';
import type { NextApiRequest, NextApiResponse } from 'next/types';

// 匯出用：一次回傳全部資料，不分頁
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const rows = await Feedback.findAll({
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  res.status(200).json(rows);
};
