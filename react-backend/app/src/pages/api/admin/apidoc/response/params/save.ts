import { saveApidocParamsFormSchema } from 'src/form/apidoc/saveApidocFormSchema';
import ApidocParams from 'src/db/models/apidoc/ApidocParams';
import errors from 'src/constants/errors';
import type { NextApiRequest, NextApiResponse } from 'next/types';

type ResponseData = {
	status: boolean;
	error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {

  if (req.method != "POST") res.status(403);

	const result = saveApidocParamsFormSchema.safeParse(req.body);

	let resStatus = false;
	let errorMessage = errors.POST_UNEXPECT;

  // delete all record
  ApidocParams.truncate()

	if (result) {
		let insertData = {};

		Object.keys(req.body).forEach((key) => {
      if(key != 'id')
        Object.assign(insertData, { [key]: req.body[key] });

		});


    const apidocResponse = await ApidocParams.create(insertData);

    if (apidocResponse)
      resStatus = true;
    else
      errorMessage = errors.EMAIL_EXIST;
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
