import { InputTextFieldProps, InputSelectFieldProps } from 'src/types';
// import { getCategories } from 'src/api';

export const RegisterTaxonSaveFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'id', type: 'hidden', label: '' },
	{ name: 'is_solved', type: 'checkbox', label: '已解決' },
	{ name: 'is_sent', type: 'checkbox', label: '信件已寄送' },
	{ name: 'response', type: 'editor', label: '回覆模板' },
];
