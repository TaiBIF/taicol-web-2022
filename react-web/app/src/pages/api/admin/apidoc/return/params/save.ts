import ApidocReturnParam from 'src/db/models/apidoc/ApidocReturnParams';
import errors from 'src/constants/errors';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { saveApidocReturnParamsFormSchema } from 'src/form/apidoc/saveApidocFormSchema';
import {z} from 'zod'

type ResponseData = {
	status: boolean;
	error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  if (req.method != "POST") res.status(403);
  const {returnParams} = req.body;

  const mode = req.body.id  ? 'update' : 'create';
	const result = saveApidocReturnParamsFormSchema.safeParse(req.body);

	let resStatus = false;
	let errorMessage = errors.POST_UNEXPECT;

  if (result) {
    // delete all record
    ApidocReturnParam.truncate()

    console.log('returnParams',returnParams)
    const apidocReturnParams = await ApidocReturnParam.bulkCreate(returnParams);

    if (apidocReturnParams)
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
