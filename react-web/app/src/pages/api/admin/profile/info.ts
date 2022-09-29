import {User} from 'src/db/models/user';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from 'src/pages/api/auth/[...nextauth]'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions)

  const email = session?.user?.email;

  if (email) {
    const user = await User.findOne({
      where: { email:email },
      attributes: {exclude: ['password','id']},
    });

    res.status(200).json(user);
  }
  else {
    res.status(401).json({ error: 'Not authorized' });
  }
};
