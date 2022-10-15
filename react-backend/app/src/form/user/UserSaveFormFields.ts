import { InputTextFieldProps, InputSelectFieldProps } from 'src/types';
import { RoleOptions } from 'src/form/options';
import type { RoleOption } from 'src/form/options';

export type UserSaveFields = {
	id: number;
	role: RoleOption;
	email: string;
	first_name: string;
	last_name: string;
	phone: string;
	password: string;
	confirm_password: string;
};

const share = [
	{ name: 'id', type: 'hidden', label: '' },
	{ name: 'email', type: 'email', label: 'Email' },
	{ name: 'phone', type: 'text', label: 'Phone Number' },
	{ name: 'first_name', type: 'text', label: 'First Name' },
	{ name: 'last_name', type: 'text', label: 'Last Name'},
	{ name: 'password', type: 'password', label: 'Password', fullWidth: false },
	{ name: 'confirm_password', type: 'password', label: 'Confirm Password', fullWidth: false },
]

export const UserSaveFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'role', type: 'select', label: 'Role', options: RoleOptions },
  ...share];

export const UpdateProfileFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = share
