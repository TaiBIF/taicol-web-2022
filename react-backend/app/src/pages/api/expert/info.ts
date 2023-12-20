import { Expert } from 'src/db/models/expert';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateExpertFormSchema } from 'src/form/expert/saveExpertFormSchema';
import { Op } from 'sequelize';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const id = req.query.id as string;
	const result = updateExpertFormSchema.pick({ id: true }).safeParse(id);
  let expert: Expert | null = null;
  // let nextPost = null;
  // let prevPost = null;

  if (result) {
    expert = await Expert.findOne({
      where: { id: id },
      // include:[{attributes:['name','name_e','person_id','taxon_group']}],
    });
  }

  //   if (expert) {
  //     nextPost = await Expert.findOne({
  //       attributes: ['slug'],
  //       where: {
  //         publishedDate: {
  //           [Op.gte]: expert.id
  //         },
  //         publish: true
  //       },
  //       order: [
  //         ['publishedDate', 'DESC']
  //       ]
  //     })


  //     prevPost = await New.findOne({
  //       attributes: ['slug'],
  //       where: {
  //         publishedDate: {
  //           [Op.lte]: news.publishedDate
  //         },
  //         publish: true
  //       },
  //       order: [
  //         ['publishedDate', 'DESC'], ['id', 'DESC']
  //       ]
  //     });
  //   }
  // }


  res.status(200).json({
    current: expert,
    // next: nextPost,
    // prev: prevPost
  });
};
