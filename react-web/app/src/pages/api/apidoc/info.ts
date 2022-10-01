import ApidocInfo from 'src/db/models/apidoc/ApidocInfo';
import ApidocParam from 'src/db/models/apidoc/ApidocParams';
import ApidocReturnParam from 'src/db/models/apidoc/ApidocReturnParams';
import ApidocResponse from 'src/db/models/apidoc/ApidocResponse';
import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const id = req.query.id;

  const apidocInfo = await ApidocInfo.findOne({
    attributes: {exclude: ['id']},
  });

  const apidocParams = await ApidocParam.findAll({
    attributes: {exclude: ['id']},
  });

  const apidocReturnParams = await ApidocReturnParam.findAll({
    attributes: {exclude: ['id']},
  });



  const  responses = await ApidocResponse.findAll({
    attributes: {exclude: ['id']},
  });

  res.status(200).json({
    info: apidocInfo,
    params: {params:apidocParams,combine_url:apidocInfo?.combine_url || ''},
    returnParams: {returnParams:apidocReturnParams},
    responses: responses,
  });
};
