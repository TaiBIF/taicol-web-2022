import {Faq} from 'src/db/models/faq';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateFaqFormSchema } from 'src/form/faq/saveFaqFormSchema';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const id = req.query.id as string;
	const result = updateFaqFormSchema.pick({ id: true }).safeParse(id);

	let faq: Faq | null = null;

	if (result) {
		faq = await Faq.findByPk(id);
	}

	res.status(200).json(faq);
};
