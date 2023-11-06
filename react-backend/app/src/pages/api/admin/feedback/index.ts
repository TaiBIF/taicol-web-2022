import {Feedback} from 'src/db/models/Feedback';
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

  const feedback = await Feedback.findAndCountAll({
    where: where,
		// include:[{attributes:['title','is_solved']}],
    offset: offset,
		limit: limit,
    order: [
      ['updatedAt', 'DESC']
    ]
	});

	res.status(200).json(feedback);
};
