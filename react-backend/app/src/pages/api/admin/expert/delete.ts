import {z} from 'zod'
import { Expert } from 'src/db/models/expert';
import errors from 'src/constants/errors';
import type { NextApiRequest, NextApiResponse } from 'next/types';

type ResponseData = {
	status: boolean;
	error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  const schema = z.object({id:z.number().positive().min(1)});
	const validateResult = schema.safeParse(req.query);

	let resStatus = false;
	let errorMessage = errors.POST_UNEXPECT;

	if (validateResult) {
      // sequliize delete by id
      const result = await Expert.destroy({ where: { id: req.query.id } });

      if (result)
          resStatus = true;
        else
          errorMessage = errors.DELETE_FAIL;
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
