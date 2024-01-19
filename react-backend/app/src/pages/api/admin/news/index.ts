import {New,Category} from 'src/db/models/news';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { Op } from 'sequelize';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { page, keyword, sort, field } = req.query;

  const pageNumber: number = page ? parseInt(page as string) : 1;
  const limit: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);
  const offset = pageNumber > 1 ? (pageNumber - 1) * limit : 0;
  const sortVar = sort != undefined ? sort as string : 'DESC'
  let fieldVar = field != undefined ? field as string : 'updatedAt'

  if (fieldVar == 'category'){
    fieldVar = 'CategoryId'
  }

  let where = {}
  if (keyword) {
    where = {
      [Op.or]: [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
      ]
    }
  }

  const news = await New.findAndCountAll({
    where: where,
		include:[{model:Category,attributes:['name','name_eng']}],
    offset: offset,
		limit: limit,
    order: [
      [fieldVar, sortVar]
    ]
	});

	res.status(200).json(news);
};
