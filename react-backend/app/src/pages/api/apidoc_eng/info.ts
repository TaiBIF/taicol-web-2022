import {Apidoc_eng} from 'src/db/models/apidoc_eng';
import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const apidocEngInfo = await Apidoc_eng.findOne({
    attributes: {exclude: ['id']},
  });

  res.status(200).json(apidocEngInfo);
};
