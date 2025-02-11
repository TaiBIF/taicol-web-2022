import { Feedback } from 'src/db/models/feedback';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { Op } from 'sequelize';
import { string } from 'zod';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { page, person_id, keyword, sort, field } = req.query;

  const pageNumber: number = page ? parseInt(page as string) : 1;
  const limit: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);
  const offset = pageNumber > 1 ? (pageNumber - 1) * limit : 0;

  const sortVar = sort != undefined ? sort as string : 'DESC'
  let fieldVar = field != undefined ? field as string : 'updatedAt'

  // if (fieldVar == 'category'){
  //   fieldVar = 'CategoryId'
  // }

  let where = {}
  
  if (keyword) {
    where = {
      [Op.or]: [
        { taxon_id: { [Op.like]: `%${keyword}%` } },
        { name: { [Op.like]: `%${keyword}%` } },
        { title: { [Op.like]: `%${keyword}%` } },
        // { description: { [Op.like]: `%${keyword}%` } },
      ]
    }
  }

  // let person_id_str: string = person_id as string;
  // let person_ids: string[] = [] 

  // if (person_id) {
  //   person_ids = person_id_str.split(',')
  //   where = { ...where,
  //     person_id: person_ids
  //   }
  // }

  const feedback = await Feedback.findAndCountAll({
    where: where,
		// include:[{attributes:['name','name_e','person_id','taxon_group']}],
    offset: offset,
		limit: limit,
    order: [
      [fieldVar, sortVar]
    ]
	});

	res.status(200).json(feedback);
};
