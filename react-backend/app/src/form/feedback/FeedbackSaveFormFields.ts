import { InputTextFieldProps, InputSelectFieldProps } from 'src/types';
// import { getCategories } from 'src/api';

export const FeedbackSaveFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'id', type: 'hidden', label: '' },
	{ name: 'is_solved', type: 'checkbox', label: '已解決' },
	{ name: 'is_sent', type: 'checkbox', label: '信件已寄送' },
	{ name: 'response', type: 'editor', label: '回覆模板' },
	// { name: 'name_e', type: 'text', label: '專家英文名' },
	// { name: 'email', type: 'text', label: 'email' },
	// { name: 'person_id', type: 'number', label: '學名管理工具對應人名ID' },
	// { name: 'taxon_group', type: 'text', label: '分類群' },
	// { name: 'publishedDate', type: 'datepicker', label: '日期' },
	// { name: 'description', type: 'editor', label: '描述' },
];
