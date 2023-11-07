import {New,Category} from 'src/db/models/news';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateNewsFormSchema } from 'src/form/news/saveNewsFormSchema';
import { Op } from 'sequelize';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const slug = req.query.slug;
	const result = updateNewsFormSchema.pick({ slug: true }).safeParse(slug);
  let news: New | null = null;
  let nextPost = null;
  let prevPost = null;

  if (result) {
    news = await New.findOne({
      where: { slug: slug },
		  include:[{model:Category, attributes:['name','name_eng','color']}],
    });

    if (news) {
      nextPost = await New.findOne({
        attributes: ['slug'],
        where: {
          publishedDate: {
            [Op.gte]: news.publishedDate
          },
          publish: true
        },
        order: [
          ['publishedDate', 'DESC']
        ]
      })


      prevPost = await New.findOne({
        attributes: ['slug'],
        where: {
          publishedDate: {
            [Op.lte]: news.publishedDate
          },
          publish: true
        },
        order: [
          ['publishedDate', 'DESC'], ['id', 'DESC']
        ]
      });
    }
  }


  res.status(200).json({
    current: news,
    next: nextPost,
    prev: prevPost
  });
};
