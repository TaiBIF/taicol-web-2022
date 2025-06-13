import { Register_taxon } from 'src/db/models/register_taxon';
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

  let where = {}
  
  if (keyword) {
    where = {
      [Op.or]: [
        // { taxon_id: { [Op.like]: `%${keyword}%` } },
        { name: { [Op.like]: `%${keyword}%` } },
        { bio_group: { [Op.like]: `%${keyword}%` } },
      ]
    }
  }

  const register_taxon = await Register_taxon.findAndCountAll({
    where: where,
    offset: offset,
		limit: limit,
    order: [
      [fieldVar, sortVar]
    ]
	});

	res.status(200).json(register_taxon);
};
