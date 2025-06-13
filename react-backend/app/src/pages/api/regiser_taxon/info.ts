import { Register_taxon } from 'src/db/models/register_taxon';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateRegisterTaxonFormSchema } from 'src/form/register_taxon/saveRegisterTaxonFormSchema';
import { Op } from 'sequelize';
import register_taxon from '.';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const id = req.query.id as string;
	const result = updateRegisterTaxonFormSchema.pick({ id: true }).safeParse(id);
  let register_taxon: Register_taxon | null = null;

  if (result) {
    register_taxon = await Register_taxon.findOne({
      where: { id: id },
    });
  }

  res.status(200).json({
    current: register_taxon,
  });
};
