import { z } from 'zod';
import errors from 'src/constants/errors';

export const saveApidocFormSchema =  z.object({
  CategoryId:z.string().or(z.number()),
  author:z.string(),
  slug: z.string().nonempty( { message: errors.NON_EMPTY }),
	title: z.string().nonempty( { message: errors.NON_EMPTY }),
});
