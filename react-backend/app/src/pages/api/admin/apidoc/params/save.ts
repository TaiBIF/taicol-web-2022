import ApidocParam from 'src/db/models/apidoc/ApidocParams';
import ApidocInfo from 'src/db/models/apidoc/ApidocInfo';

import errors from 'src/constants/errors';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { saveApidocParamsFormSchema } from 'src/form/apidoc/saveApidocFormSchema';
import {z} from 'zod'

type ResponseData = {
	status: boolean;
	error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  if (req.method != "POST") res.status(403);
  const {params,combine_url} = req.body;

	const result = saveApidocParamsFormSchema.safeParse(req.body);

	let resStatus = false;
	let errorMessage = errors.POST_UNEXPECT;

  if (result) {
    // delete all record
    ApidocParam.truncate()

    const apidocInfo = await ApidocInfo.findOne()

    if (apidocInfo) {
      await ApidocInfo.update({ combine_url: combine_url }, { where: { id: apidocInfo.id } });
    }
    else {
      await ApidocInfo.create({ combine_url: combine_url,title:' ',url: '' });
    }

    const apidocParams = await ApidocParam.bulkCreate(params);

    if (apidocParams)
      resStatus = true;
    else
      errorMessage = errors.POST_UNEXPECT;
  }

	const resData: ResponseData = resStatus
		? {
				status: resStatus,
		  }
		: {
				status: resStatus,
				error: errorMessage,
		  };

	res.status(200).json(resData);
};
