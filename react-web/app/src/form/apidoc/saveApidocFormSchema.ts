import { z } from 'zod';
import errors from 'src/constants/errors';

export const saveApidocInfoFormSchema =  z.object({
	title: z.string().nonempty( { message: errors.NON_EMPTY }),
	url: z.string().url().nonempty( { message: errors.NON_EMPTY }),
});

export const saveApidocParamsFormSchema = z.object({
  combine_url:z.string().url().nonempty( { message: errors.NON_EMPTY }),
  params: z.array(
    z.object({
      keyword: z.string().nonempty( { message: errors.NON_EMPTY }),
      description: z.string().optional().or(z.literal('')).nullable(),
      url: z.string().url().optional().or(z.literal('')).nullable(),
  }))
});

export const saveApidocReturnParamsFormSchema = z.object({
  returnParams: z.array(
    z.object({
      keyword: z.string().nonempty( { message: errors.NON_EMPTY }),
      description: z.string().optional().or(z.literal('')).nullable(),
      remark: z.string().optional().or(z.literal('')).nullable(),
  }))
});

const apidocResponseShare = {
	title: z.string().nonempty( { message: errors.NON_EMPTY }),
	content: z.string().optional().or(z.literal('')).nullable(),
};

export const createApidocResponseFormSchema = z.object({
	...apidocResponseShare,
})

export const updateApidocResponseFormSchema = z.object({
	id: z.number().min(1, { message: errors.NON_EMPTY }),
	...apidocResponseShare
});
