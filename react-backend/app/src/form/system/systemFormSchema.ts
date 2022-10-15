import { z } from 'zod';
import errors from 'src/constants/errors';

export const systemFormSchema = z.object({
	email: z.string().nonempty( { message: errors.NON_EMPTY }).email(errors.EMAIL_INVALID),
	phone: z.string().nonempty( { message: errors.NON_EMPTY }),
	fax: z.string().nonempty( { message: errors.NON_EMPTY }),
	address: z.string().nonempty( { message: errors.NON_EMPTY }),
});
