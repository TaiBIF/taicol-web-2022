import { z } from 'zod';
import errors from 'src/constants/errors';

const share = {
	feedback_type: z.string().transform((val) => parseInt(val, 10)).or(z.number()),
  title: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
  notify: z.boolean().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  response: z.string().optional(),
  taxon_id: z.string().optional(),
  is_solved: z.boolean().optional(),
  is_sent: z.boolean().optional(),
};

export const createFeedbackFormSchema = z.object({
	...share,
})

export const updateFeedbackFormSchema = z.object({
	id: z.number().min(1, { message: errors.NON_EMPTY }),
  updatedAt: z.preprocess((arg) => {
      console.log('arg',arg);
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
  createdAt: z.preprocess((arg) => {
      console.log('arg',arg);
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
	...share
});
