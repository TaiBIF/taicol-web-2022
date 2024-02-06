import { z } from 'zod';
import errors from 'src/constants/errors';

const share = {
  CategoryId: z.string().or(z.number()),
  slug: z.string().nonempty( { message: errors.NON_EMPTY }),
  title: z.string().nonempty({ message: errors.NON_EMPTY }),
  publishedDate: z.preprocess((arg) => {
    // console.log('arg',arg);
  if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
}, z.date()),
  description: z.string().nonempty( { message: errors.NON_EMPTY }),
  publish:z.boolean().default(true),
  show_in_zh:z.boolean().default(false),
  show_in_en:z.boolean().default(false)
};

export const createNewsFormSchema = z.object({
	...share,
})

export const updateNewsFormSchema = z.object({
	id: z.number().min(1, { message: errors.NON_EMPTY }),
	...share
});
