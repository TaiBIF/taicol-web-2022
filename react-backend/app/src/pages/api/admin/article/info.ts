import {Article} from 'src/db/models/article';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateArticleFormSchema } from 'src/form/article/saveArticleFormSchema';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const id = req.query.id as string;
	const result = updateArticleFormSchema.pick({ id: true }).safeParse(id);

	let article: Article | null = null;

	if (result) {
		article = await Article.findByPk(id);
	}

	res.status(200).json(article);
};
