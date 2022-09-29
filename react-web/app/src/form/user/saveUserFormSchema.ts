import { z } from 'zod';
import errors from 'src/constants/errors';
import { roles } from 'src/form/options';
const passwordLengthRegex = new RegExp(/^(\S{6,})?$/)

const share = {
	email: z.string().nonempty( { message: errors.NON_EMPTY }).email(errors.EMAIL_INVALID),
	first_name: z.string().nonempty( { message: errors.NON_EMPTY }),
	last_name: z.string().nonempty( { message: errors.NON_EMPTY }),
	phone: z.string().nonempty( { message: errors.NON_EMPTY }),
};
export const createUserFormSchema = z.object({
	...share,
  role: z.enum(roles).default(roles[0]),
	password: z.string().regex(passwordLengthRegex, errors.PASSWORD_LENGTH_MUST_MORE_THAN_6),
	confirm_password: z.string().regex(passwordLengthRegex, errors.CONFIRM_PASSWORD_LENGTH_MUST_MORE_THAN_6),
}).refine(data => data.password === data.confirm_password, {
			path: ['confirm_password'],
			message: errors.PASSWORD_NOT_MATCHED,
		});

export const updateUserFormSchema = z.object({
	id: z.number().min(1, { message: errors.NON_EMPTY }),
	...share,
  role: z.enum(roles).default(roles[0]),
	password: z.string().regex(passwordLengthRegex, errors.PASSWORD_LENGTH_MUST_MORE_THAN_6).optional(),
	confirm_password: z.string().regex(passwordLengthRegex, errors.CONFIRM_PASSWORD_LENGTH_MUST_MORE_THAN_6).optional(),
}).refine(data => data.password === data.confirm_password || !data.password, {
			path: ['confirm_password'],
			message: errors.PASSWORD_NOT_MATCHED,
		});

export const updateProfileFormSchema = z.object({
	...share,
	password: z.string().regex(passwordLengthRegex, errors.CONFIRM_PASSWORD_LENGTH_MUST_MORE_THAN_6).optional(),
	confirm_password: z.string().regex(passwordLengthRegex, errors.CONFIRM_PASSWORD_LENGTH_MUST_MORE_THAN_6).optional(),
}).refine(data => data.password === data.confirm_password || !data.password, {
			path: ['confirm_password'],
			message: errors.PASSWORD_NOT_MATCHED,
		});
