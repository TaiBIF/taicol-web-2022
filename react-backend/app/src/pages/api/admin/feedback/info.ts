import { Feedback } from 'src/db/models/feedback';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateFeedbackFormSchema } from 'src/form/feedback/saveFeedbackFormSchema';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const id = req.query.id as string;
	const result = updateFeedbackFormSchema.pick({ id: true }).safeParse(id);

	let feedback: Feedback | null = null;

	if (result) {
		feedback = await Feedback.findByPk(id);
	}

	res.status(200).json(feedback);
};
