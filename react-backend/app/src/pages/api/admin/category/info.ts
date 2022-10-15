import Category from 'src/db/models/Category';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateNewsFormSchema } from 'src/form/news/saveNewsFormSchema';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const id = req.query.id as string;
	const result = updateNewsFormSchema.pick({ id: true }).safeParse(id);

	let news: Category | null = null;

	if (result) {
		news = await Category.findByPk(id);
	}

	res.status(200).json(news);
};
