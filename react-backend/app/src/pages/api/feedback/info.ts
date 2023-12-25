import { Feedback } from 'src/db/models/feedback';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateFeedbackFormSchema } from 'src/form/feedback/saveFeedbackFormSchema';
import { Op } from 'sequelize';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const id = req.query.id as string;
	const result = updateFeedbackFormSchema.pick({ id: true }).safeParse(id);
  let feedback: Feedback | null = null;
  // let nextPost = null;
  // let prevPost = null;

  if (result) {
    feedback = await Feedback.findOne({
      where: { id: id },
      // include:[{attributes:['name','name_e','person_id','taxon_group']}],
    });
  }

  //   if (feedback) {
  //     nextPost = await Feedback.findOne({
  //       attributes: ['slug'],
  //       where: {
  //         publishedDate: {
  //           [Op.gte]: feedback.id
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
    current: feedback,
    // next: nextPost,
    // prev: prevPost
  });
};
