import {Article,Category} from 'src/db/models/article';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateArticleFormSchema } from 'src/form/article/saveArticleFormSchema';
import { Op } from 'sequelize';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const slug = req.query.slug;
	const result = updateArticleFormSchema.pick({ slug: true }).safeParse(slug);

	let article: Article | null = null;
  let nextPost = null;
  let prevPost = null;

  if (result) {
    article = await Article.findOne({
      where: { slug: slug },
		include:[{model:Category,attributes:['name','color']}],
    });

    if (article) {
      nextPost = await Article.findOne({
        attributes: ['slug'],
        where: {
          publishedDate: {
            [Op.gt]: article.publishedDate
          },
          publish: true
        }
      })


      prevPost = await Article.findOne({
        attributes: ['slug'],
        where: {
          publishedDate: {
            [Op.lt]: article.publishedDate
          },
          publish: true
        }
      });
    }
  }


  res.status(200).json({
    current: article,
    next: nextPost,
    prev: prevPost
  });
};
