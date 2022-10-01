import { saveApidocReturnParamsFormSchema } from 'src/form/apidoc/saveApidocFormSchema';
import ApidocReturnParams from 'src/db/models/apidoc/ApidocReturnParams';
import errors from 'src/constants/errors';
import type { NextApiRequest, NextApiResponse } from 'next/types';

type ResponseData = {
	status: boolean;
	error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {

  if (req.method != "POST") res.status(403);

	const result = saveApidocReturnParamsFormSchema.safeParse(req.body);

	let resStatus = false;
	let errorMessage = errors.POST_UNEXPECT;

  // delete all record
  ApidocReturnParams.truncate()

	if (result) {
		let insertData = {};

		Object.keys(req.body).forEach((key) => {
      if(key != 'id')
        Object.assign(insertData, { [key]: req.body[key] });

		});


    const apidocResponse = await ApidocReturnParams.create(insertData);

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
