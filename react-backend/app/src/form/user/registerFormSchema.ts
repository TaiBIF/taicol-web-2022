import { z } from 'zod';
import errors from 'src/constants/errors';

export const registerFormSchema = z
	.object({
		email: z.string().nonempty( { message: errors.NON_EMPTY }).email(errors.EMAIL_INVALID),
		phone: z.string().nonempty( { message: errors.NON_EMPTY }),
		password: z.string().min(6, errors.PASSWORD_LENGTH_MUST_MORE_THAN_6),
		confirm_password: z.string().min(6, errors.CONFIRM_PASSWORD_LENGTH_MUST_MORE_THAN_6),
	})
	.refine((data) => data.password === data.confirm_password, {
		path: ['confirm_password'],
		message: errors.PASSWORD_NOT_MATCHED,
	});
