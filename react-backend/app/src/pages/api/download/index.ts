import { Download, DownloadFile,Category } from 'src/db/models/download';

import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { cid,page } = req.query;

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

  const download = await Download.findAll({
    where: where,
		include:[{model:Category,attributes:['id']},{model:DownloadFile}],
    order: [
      ['publishedDate', 'DESC']
    ]
	});

	res.status(200).json(download);
};
