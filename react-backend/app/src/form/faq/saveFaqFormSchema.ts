import { z } from 'zod';
import errors from 'src/constants/errors';

const share = {
  CategoryId:z.string().or(z.number()),
	title: z.string().nonempty( { message: errors.NON_EMPTY }),
	description: z.string().nonempty( { message: errors.NON_EMPTY }),
  sort: z.string().transform((val) => parseInt(val, 10)).or(z.number()).optional(),
  publish:z.boolean().default(true),
  show_in_zh:z.boolean().default(false),
  show_in_en:z.boolean().default(false)
};

export const createFaqFormSchema = z.object({
	...share,
})

export const updateFaqFormSchema = z.object({
	id: z.number().min(1, { message: errors.NON_EMPTY }),
	...share
});
