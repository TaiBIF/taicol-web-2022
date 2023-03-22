import {Article,Category} from 'src/db/models/article';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { Op } from 'sequelize';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { page, keyword } = req.query;

  const pageNumber: number = page ? parseInt(page as string) : 1;
  const limit: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);
  const offset = pageNumber > 1 ? (pageNumber - 1) * limit : 0;

  let where = {}
  if (keyword) {
    where = {
      [Op.or]: [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
      ]
    }
  }

  const article = await Article.findAndCountAll({
    where: where,
		include:[{model:Category,attributes:['name']}],
    offset: offset,
		limit: limit,
    order: [
      ['updatedAt', 'DESC']
    ]
	});

	res.status(200).json(article);
};
