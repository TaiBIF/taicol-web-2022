import { saveApidocFormSchema } from 'src/form/apidoc/saveApidocFormSchema';
import {Apidoc} from 'src/db/models/apidoc';
import errors from 'src/constants/errors';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import utf8 from 'utf8';
const fs = require('fs');

type ResponseData = {
	status: boolean;
	error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {

  if (req.method != "POST") res.status(403);

	const result = saveApidocFormSchema.safeParse(req.body);

	let resStatus = false;
  let errorMessage = errors.POST_UNEXPECT;

  const url = new URL(req.body.markdown);
  try {
    const data = fs.readFileSync(decodeURIComponent(`public${url.pathname}`), 'utf8');

    // delete all record
    Apidoc.truncate()

    if (result) {
      let insertData = {content:utf8.encode(data),markdown:req.body.markdown};


      const apidocResponse = await Apidoc.create(insertData);

      if (apidocResponse)
        resStatus = true;
      else
        errorMessage = errors.EMAIL_EXIST;
    }
     } catch (err) {
    console.error(err);
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
