import { z } from 'zod';
import errors from 'src/constants/errors';

const share = {
	type: z.string().nonempty({ message: errors.NON_EMPTY }),
	title: z.string().nonempty({ message: errors.NON_EMPTY }),
	description: z.string().nonempty({ message: errors.NON_EMPTY }),
	reference: z.string().nonempty({ message: errors.NON_EMPTY }),
	notify: z.boolean().default(true),
  name:  z.string().nonempty({ message: errors.NON_EMPTY }),
  email:   z.string().nonempty({ message: errors.NON_EMPTY }),
  response:  z.string().nonempty({ message: errors.NON_EMPTY }),
  is_solved: z.boolean().default(false),
	updatedAt: z.date(),
	createdAt: z.date()

};

export const createFeedbackFormSchema = z.object({
	...share,
})

export const updateFeedbackFormSchema = z.object({
	id: z.number().min(1, { message: errors.NON_EMPTY }),
	...share
});
