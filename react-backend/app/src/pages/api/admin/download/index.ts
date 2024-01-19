import {Download,DownloadFile,Category} from 'src/db/models/download';
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

  let include = [{
    model: Category,
    attributes: ['id','name','name_eng'],
    required: true 
  }, 
  {
    model: DownloadFile, 
    // required: false 
  }]

  let where = {}

  if (keyword) {
    where = {
      [Op.or]: [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { "$Category.name$": { [Op.like]: `%${keyword}%` } },
      ]
    }
  }

  // if (cid && cid != 'all') {
  //   where = {
  //     publish:true,
  //     CategoryId:cid
  //   }
  // }
  // else {
  //   where = {publish:true}
  // }

  const download = await Download.findAndCountAll({
    where: where,
    include: include,
		// include: [{model:Category,attributes:['id','name','name_eng']},{model:DownloadFile}],
    order: [
      [fieldVar, sortVar]
    ],
    offset: offset,
		limit: limit,
	});

	res.status(200).json(download);
};
