import { InputTextFieldProps, InputFileFieldProps } from 'src/types';

export const SystemFormFields: Array<InputTextFieldProps | InputFileFieldProps> = [
	{ name: 'logo', type: 'photo', label: 'Upload Logo' },
	{ name: 'company_name', type: 'text', label: 'Company Name', fullWidth: false },
	{ name: 'phone', type: 'text', label: 'Phone', fullWidth: false },
	{ name: 'fax', type: 'text', label: 'Fax', fullWidth: false },
	{ name: 'address', type: 'text', label: 'Address', fullWidth: false },
];
