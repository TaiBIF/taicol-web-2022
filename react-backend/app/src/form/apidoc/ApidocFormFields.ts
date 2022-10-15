import { InputTextFieldProps } from 'src/types';

export const ApidocInfoFields: Array<InputTextFieldProps> = [
	{ name: 'title', type: 'text', label: '標題' },
  { name: 'url', type: 'text', label: '本API服務網址為' },
];

export const ApiParamCombineUrlFields: Array<InputTextFieldProps> = [
  { name: 'combine_url', type: 'text', label: '參數可相互組合網址為' },
];

export const ApiParamsFields: Array<InputTextFieldProps>= [
	{ name: 'keyword', type: 'text', label: '查詢參數',gridSize:4 },
  {name: 'description', type: 'text', label: '說明',gridSize:4},
  {name: 'url', type: 'url', label: '範例網址',gridSize:4},
];

export const ApiReturnParamsFields: Array<InputTextFieldProps>= [
	{ name: 'keyword', type: 'text', label: '查詢參數',gridSize:4 },
  {name: 'description', type: 'text', label: '說明',gridSize:4},
  {name: 'remark', type: 'text', label: '備註',gridSize:4},
];


export const ApiResponseFields: Array<InputTextFieldProps>= [
	{ name: 'id', type: 'hidden', label: '' },
	{ name: 'title', type: 'text', label: '標題',gridSize:12 },
  {name: 'content', type: 'editor', label: '說明',gridSize:12},
];
