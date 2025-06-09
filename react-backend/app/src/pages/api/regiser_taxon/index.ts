import { Register_taxon } from 'src/db/models/register_taxon';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { Op } from 'sequelize';
import type { whereConditionProp } from 'src/types/frontend';

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const register_taxon = await Register_taxon.findAndCountAll({
    order: [
      ['createdAt', 'DESC']
    ]
	});
	res.status(200).json(register_taxon);
};
