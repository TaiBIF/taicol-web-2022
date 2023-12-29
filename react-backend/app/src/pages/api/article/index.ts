import {Article,Category} from 'src/db/models/article';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { Op } from 'sequelize';
import type { whereConditionProp } from 'src/types/frontend';
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { cid,page,show_in_en,show_in_zh } = req.query;

  const pageNumber: number = page ? parseInt(page as string) : 1;
  const limit: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);
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

  if (show_in_en) {
    where = {...where, 'show_in_en': show_in_en}
  }

  if (show_in_zh) {
    where = {...where, 'show_in_zh': show_in_zh}
  }

  const article = await Article.findAndCountAll({
    where: where,
		include:[{model:Category,attributes:['name','name_eng','color']}],
    offset: offset,
    limit: limit,
     order: [
       ['updatedAt', 'DESC']
     ]
	});

	res.status(200).json(article);
};
