import { z } from 'zod';
import errors from 'src/constants/errors';

export const saveApidocFormSchema =  z.object({
	markdown: z.string().nonempty( { message: errors.NON_EMPTY }),
});
