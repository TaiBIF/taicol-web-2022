import {Apidoc} from 'src/db/models/apidoc';
import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const apidocInfo = await Apidoc.findOne({
    attributes: {exclude: ['id']},
  });

  res.status(200).json(apidocInfo);
};
