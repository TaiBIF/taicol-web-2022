import {Feedback} from 'src/db/models/Feedback';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateFeedbackFormSchema } from 'src/form/feedback/saveFeedbackFormSchema';
import { Op } from 'sequelize';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const slug = req.query.slug;
	const result = updateFeedbackFormSchema.pick({}).safeParse(slug);

	let feedback: Feedback | null = null;
  let nextPost = null;
  let prevPost = null;

  if (result) {
    feedback = await Feedback.findOne({
      // where: { slug: slug },
		// include:[{attributes:['title','is_solved']}],
    });

    // if (feedback) {
    //   nextPost = await Feedback.findOne({
    //     attributes: ['slug'],
    //     where: {
    //       publishedDate: {
    //         [Op.gt]: feedback.publishedDate
    //       },
    //       publish: true
    //     }
    //   })


    //   prevPost = await Feedback.findOne({
    //     attributes: ['slug'],
    //     where: {
    //       publishedDate: {
    //         [Op.lt]: feedback.publishedDate
    //       },
    //       publish: true
    //     }
    //   });
    // }
  }


  res.status(200).json({
    current: feedback,
    // next: nextPost,
    // prev: prevPost
  });
};
