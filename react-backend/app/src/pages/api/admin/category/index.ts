import Category from 'src/db/models/Category';
import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {type} = req.query;

  const categories = await Category.findAll({
    where: { type: type }, order: [['sort', 'ASC']],
  });

	res.status(200).json(categories);
};
