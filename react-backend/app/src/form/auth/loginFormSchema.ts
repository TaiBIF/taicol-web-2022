import { z } from 'zod';
import errors from 'src/constants/errors';

export const loginFormSchema = z
	.object({
		email: z.string().nonempty( { message: errors.NON_EMPTY }).email(errors.EMAIL_INVALID),
		password: z.string().min(6, errors.PASSWORD_LENGTH_MUST_MORE_THAN_6),
	})
