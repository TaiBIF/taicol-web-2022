import { z } from 'zod';
import errors from 'src/constants/errors';

const share = {
	type: z.string().nonempty( { message: errors.NON_EMPTY }),
	name: z.string().nonempty( { message: errors.NON_EMPTY }),
	name_eng: z.string().nonempty( { message: errors.NON_EMPTY }),
	color: z.string(),
	sort: z.string().transform((val) => parseInt(val, 10)).or(z.number())
};

const checkStringNumber = (val:string) => !Number.isNaN(parseInt(val, 10))
export const createCategoryFormSchema = z.object({
	...share,
})

export const updateCategoryFormSchema = z.object({
	id: z.number().min(1, { message: errors.NON_EMPTY }),
	...share
})
