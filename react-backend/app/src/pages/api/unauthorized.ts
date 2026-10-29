import type { NextApiRequest, NextApiResponse } from 'next/types';

// middleware.ts 把未登入的 /api/admin/* 請求 rewrite 到這裡（Next 12 的 middleware 不能直接回傳內容）
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(401).json({ status: false, error: 'unauthorized' });
}
