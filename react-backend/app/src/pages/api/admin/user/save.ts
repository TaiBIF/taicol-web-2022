import bcrypt from 'bcryptjs';

import { createUserFormSchema,updateUserFormSchema } from 'src/form/user/saveUserFormSchema';
import {User} from 'src/db/models/user';
import errors from 'src/constants/errors';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import {Op} from 'sequelize';

type ResponseData = {
	status: boolean;
	error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {

  const mode = req.body.id  ? 'update' : 'create';
	const result = (mode == 'update' ? updateUserFormSchema : createUserFormSchema).safeParse(req.body);

  let resStatus = false;
	let errorMessage = errors.POST_UNEXPECT;

	if (result) {
		let insertData = {};

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
        if(key != 'id')
          Object.assign(insertData, { [key]: req.body[key] });
      }
		});

    const conditions = { email: req.body.email,status:{ [Op.ne]: 'deleted' }}
    const where = mode == 'create' ? conditions : { ...conditions, id: { [Op.ne]: req.body.id } };

    const findEmail = await User.findOne({
      where: where,
    });

    if (!findEmail) {
      if (mode == 'create') {
        const user = await User.create(insertData);

        if (user) resStatus = true;
        // send confirm email to user
        /**
        const subject = 'Admin Email';
        const body = `email:${insertData.email} password:${insertData.password}`;
        sendmail(insertData.email, subject, body);

        */
      }
      else {
        const result = await User.update(insertData, { where: { id: req.body.id } });

        if(result)
          resStatus = true;
      }
    }
    else {
        errorMessage = errors.EMAIL_EXIST;
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
