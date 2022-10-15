import {New,Category} from 'src/db/models/news';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { Op } from 'sequelize';
import type { whereConditionProp } from 'src/types/frontend';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { cid,page } = req.query;

  const pageNumber: number = page ? parseInt(page as string) : 1;
  const limit: number = 3;
  const offset = pageNumber > 1 ? (pageNumber - 1) * limit : 0;

  let where:whereConditionProp = { publish:true}

  if (cid && cid != 'all') {
    where = {
      ...where,
      CategoryId:cid
    }
  }
  else {
    where = {...where,CategoryId:{[Op.ne]:null}}
  }

  const news = await New.findAndCountAll({
    where: where,
		include:[{model:Category,attributes:['name','color']}],
    offset: offset,
		limit: limit,
	});

	res.status(200).json(news);
};
