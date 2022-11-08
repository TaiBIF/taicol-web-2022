import {Download,DownloadFile,Category} from 'src/db/models/download';

import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { page, cid } = req.query;

  const pageNumber: number = page ? parseInt(page as string) : 1;
  const limit: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);
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

  const download = await Download.findAndCountAll({
    where: where,
		include:[{model:Category,attributes:['id','name']},{model:DownloadFile}],
    order: [
      ['id', 'DESC']
    ],
    offset: offset,
		limit: limit,
	});

	res.status(200).json(download);
};
