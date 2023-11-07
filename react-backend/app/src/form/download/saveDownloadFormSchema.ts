import { z } from 'zod';
import errors from 'src/constants/errors';

const share = {
	CategoryId:z.string().or(z.number()),
	title: z.string().nonempty( { message: errors.NON_EMPTY }),
	description: z.string().nonempty( { message: errors.NON_EMPTY }),
	title_eng: z.string().nonempty( { message: errors.NON_EMPTY }),
	description_eng: z.string().nonempty( { message: errors.NON_EMPTY }),
	publish: z.boolean().default(true),
	DownloadFiles: z.array(
	z.object({
		type: z.string().nonempty( { message: errors.NON_EMPTY }),
		url: z.string().nonempty( { message: errors.NON_EMPTY }),
	}))
};

export const createDownloadFormSchema = z.object({
	...share,
})

export const updateDownloadFormSchema = z.object({
	id: z.number().min(1, { message: errors.NON_EMPTY }),
	...share
});
