import { InputTextFieldProps } from 'src/types';

export const ApidocFormFields: Array<InputTextFieldProps> = [
	{ name: 'title', type: 'text', label: '標題' },
  {name: 'url', type: 'text', label: 'API URL'},
];

export const ApiParamsFormFields: Array<InputTextFieldProps> = [
	{ name: 'keyword', type: 'text', label: '查詢參數',gridSize:4 },
  {name: 'description', type: 'text', label: '說明',gridSize:4},
  {name: 'url', type: 'text', label: '範例網址',gridSize:4},
];
