import { createArticleFormSchema,updateArticleFormSchema } from 'src/form/article/saveArticleFormSchema';
import {Article} from 'src/db/models/article';
import errors from 'src/constants/errors';
import type { NextApiRequest, NextApiResponse } from 'next/types';

type ResponseData = {
	status: boolean;
	error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {

  if (req.method != "POST") res.status(403);

  const mode = req.body.id  ? 'update' : 'create';
	const result = mode == 'update' ? updateArticleFormSchema : createArticleFormSchema
    .safeParse(req.body);

	let resStatus = false;
	let errorMessage = errors.POST_UNEXPECT;

	if (result) {
		let insertData = {};

		Object.keys(req.body).forEach((key) => {
      if(key != 'id')
        Object.assign(insertData, { [key]: req.body[key] });

		});

    if (mode == 'create') {

      const article = await Article.create(insertData);

      if (article)
        resStatus = true;
      else
        errorMessage = errors.EMAIL_EXIST;
    }
    else {
      const result = await Article.update(insertData, { where: { id: req.body.id } });

      if(result)
        resStatus = true;
    }
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
