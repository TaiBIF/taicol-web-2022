import { z } from 'zod';
import errors from 'src/constants/errors';

const share = {
  CategoryId: z.string().or(z.number()),
  slug: z.string().nonempty( { message: errors.NON_EMPTY }),
	title: z.string().nonempty( { message: errors.NON_EMPTY }),
  description: z.string().nonempty( { message: errors.NON_EMPTY }),
  publish:z.boolean().default(true)
};

export const createNewsFormSchema = z.object({
	...share,
})

export const updateNewsFormSchema = z.object({
	id: z.number().min(1, { message: errors.NON_EMPTY }),
	...share
});
