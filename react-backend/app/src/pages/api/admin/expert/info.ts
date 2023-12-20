import { Expert } from 'src/db/models/expert';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateExpertFormSchema } from 'src/form/expert/saveExpertFormSchema';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const id = req.query.id as string;
	const result = updateExpertFormSchema.pick({ id: true }).safeParse(id);

	let expert: Expert | null = null;

	if (result) {
		expert = await Expert.findByPk(id);
	}

	res.status(200).json(expert);
};
