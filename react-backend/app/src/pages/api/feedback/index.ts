import {Feedback} from 'src/db/models/Feedback';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { Op } from 'sequelize';
import type { whereConditionProp } from 'src/types/frontend';
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { cid,page } = req.query;

  const pageNumber: number = page ? parseInt(page as string) : 1;
  const limit: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);
  const offset = pageNumber > 1 ? (pageNumber - 1) * limit : 0;

  // let where:whereConditionProp = { publish:true}

  // if (cid && cid != 'all') {
  //   where = {
  //     ...where,
  //     CategoryId:cid
  //   }
  // }
  // else {
  //   where = {...where,CategoryId:{[Op.ne]:null}}
  // }

  const feedback = await Feedback.findAndCountAll({
    // where: where,
		// include:[{attributes:['title','is_solved']}],
    offset: offset,
    limit: limit,
     order: [
       ['updatedAt', 'DESC']
     ]
	});

	res.status(200).json(feedback);
};
