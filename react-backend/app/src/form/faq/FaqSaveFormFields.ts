import { InputTextFieldProps, InputSelectFieldProps } from 'src/types';
import { getCategories } from 'src/api';

export const FaqSaveFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'publish', type: 'switch', label: '發佈' },
	{ name: 'show_in_en', type: 'checkbox', label: '顯示於英文版' },
	{ name: 'show_in_zh', type: 'checkbox', label: '顯示於中文版' },
	{ name: 'id', type: 'hidden', label: '' },
	{ name: 'CategoryId', type: 'select', label: '類別', options: getCategories('faq'), async:true },
	{ name: 'title', type: 'text', label: '問題' },
	{ name: 'sort', type: 'string', label: '排序' },
	{ name: 'description', type: 'text', label: '回答', multiline: true, rows: 8 },
];