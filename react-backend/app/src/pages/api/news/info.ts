import {New,Category} from 'src/db/models/news';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateNewsFormSchema } from 'src/form/news/saveNewsFormSchema';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const slug = req.query.slug;
	const result = updateNewsFormSchema.pick({ slug: true }).safeParse(slug);

	let news: New | null = null;

	if (result) {
    news = await New.findOne({
      where: { slug: slug },
      include: [Category]
    });
	}

	res.status(200).json(news);
};
