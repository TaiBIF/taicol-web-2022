import { InputTextFieldProps, InputSelectFieldProps } from 'src/types';
// import { getCategories } from 'src/api';

export const ExpertSaveFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'id', type: 'hidden', label: '' },
	{ name: 'name', type: 'text', label: '專家名' },
	{ name: 'name_e', type: 'text', label: '專家英文名' },
	{ name: 'email', type: 'text', label: 'email' },
	{ name: 'person_id', type: 'number', label: '學名管理工具對應人名ID' },
	{ name: 'taxon_group', type: 'text', label: '分類群' },
	// { name: 'publishedDate', type: 'datepicker', label: '日期' },
	// { name: 'description', type: 'editor', label: '描述' },
];
