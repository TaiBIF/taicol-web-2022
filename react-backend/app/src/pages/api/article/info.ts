import {Article} from 'src/db/models/article';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateArticleFormSchema } from 'src/form/article/saveArticleFormSchema';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const slug = req.query.slug;
	const result = updateArticleFormSchema.pick({ slug: true }).safeParse(slug);

	let article: Article | null = null;

	if (result) {
		article = await Article.findOne({where:{slug:slug}});
	}

	res.status(200).json(article);
};
