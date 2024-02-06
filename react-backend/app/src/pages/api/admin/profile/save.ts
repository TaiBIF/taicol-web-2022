import bcrypt from 'bcryptjs';

import { createUserFormSchema,updateUserFormSchema } from 'src/form/user/saveUserFormSchema';
import {User} from 'src/db/models/user';
import errors from 'src/constants/errors';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from 'src/pages/api/auth/[...nextauth]'

type ResponseData = {
	status: boolean;
	error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {

  const session = await unstable_getServerSession(req, res, authOptions)
  const email = session?.user?.email;

  const mode = req.body.id  ? 'update' : 'create';
	const result = (mode == 'update' ? updateUserFormSchema : createUserFormSchema).safeParse(req.body);

	let resStatus = false;
	let errorMessage = errors.POST_UNEXPECT;

  if (result) {
    let insertData = {};

    delete req.body.confirm_password;
    Object.keys(req.body).forEach((key) => {
      if (key == 'password') {
        if (req.body[key]) {
          const saltRounds = 10;
          const salt = bcrypt.genSaltSync(saltRounds);
          Object.assign(insertData, {
            password: bcrypt.hashSync(req.body[key], salt),
          });
        }
      }
      else {
        Object.assign(insertData, { [key]: req.body[key] });
      }
    });

    const result = await User.update(insertData, { where: { email: email } });

    // console.log('insertData',insertData);
    if (result)
      resStatus = true;
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
