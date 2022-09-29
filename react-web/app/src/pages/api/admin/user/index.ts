import {User} from 'src/db/models/user';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import {Op} from 'sequelize';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const users = await User.findAndCountAll({
    attributes: {exclude: ['password']},
    where:{status:{ [Op.ne]: 'deleted' }},
		offset: 0,
		limit: 10,
	});

	res.status(200).json(users);
};
