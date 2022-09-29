import bcrypt from 'bcrypt';

import { createCategoryFormSchema,updateCategoryFormSchema } from 'src/form/category/saveCategoryFormSchema';
import {Category} from 'src/db/models/news';
import errors from 'src/constants/errors';
import type { NextApiRequest, NextApiResponse } from 'next/types';

type ResponseData = {
	status: boolean;
	error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {


  const mode = req.body.id ? 'update' : 'create';
  const schema = mode == 'update' ? updateCategoryFormSchema : createCategoryFormSchema;
	const result = schema.safeParse(req.body);

  console.log('schema result',result)
	let resStatus = false;
	let errorMessage = errors.POST_UNEXPECT;

	if (result) {
		let insertData = {};

		Object.keys(req.body).forEach((key) => {
      if(key != 'id')
        Object.assign(insertData, { [key]: req.body[key] });

		});

    if (mode == 'create') {
      const category = await Category.create(insertData);

      if (category)
        resStatus = true;
      else
        errorMessage = errors.EMAIL_EXIST;
    }
    else {
      const result = await Category.update(insertData, { where: { id: req.body.id } });

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
