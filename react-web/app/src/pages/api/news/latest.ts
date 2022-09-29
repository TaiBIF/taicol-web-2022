import {New,Category} from 'src/db/models/news';
import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { cid,page } = req.query;

  const pageNumber: number = page ? parseInt(page as string) : 1;
  const limit: number = 3;
  const offset = pageNumber > 1 ? (pageNumber - 1) * limit : 0;

  let where = {}

  if (cid && cid != 'all') {
    where = {
      publish:true,
      CategoryId:cid
    }
  }
  else {
    where = {publish:true}
  }

  const news = await New.findAndCountAll({
    where: where,
		include:[{model:Category,attributes:['name','color']}],
    offset: offset,
		limit: limit,
	});

	res.status(200).json(news);
};
