import { InputTextFieldProps, InputSelectFieldProps, InputFileFieldProps } from 'src/types';

export const RegisterFormFields: Array<InputTextFieldProps> = [
	{ name: 'email', type: 'text', label: 'Email' },
	{ name: 'password', type: 'password', label: 'Password' },
	{ name: 'confirm_password', type: 'password', label: 'Confirm Password' },
];
