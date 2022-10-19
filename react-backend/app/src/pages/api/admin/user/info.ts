import {User} from 'src/db/models/user';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateUserFormSchema } from 'src/form/user/saveUserFormSchema';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const id = req.query.id as string;

	let user: User | null = null;

  user = await User.findByPk(id, {
      attributes: {exclude: ['password']},
  })

	res.status(200).json(user);
};
