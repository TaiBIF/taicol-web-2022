import { InputTextFieldProps, InputSelectFieldProps } from 'src/types';
import {OptionProp} from 'src/types'
import { getCategories } from 'src/api';
import { DownloadFileTypeOptions } from '../options';

export type DownloadSaveFields = {
	id: number;
	title: OptionProp;
  file: string;
  type: string;
	description: string;
	category: string;
};

export const DownloadSaveFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'publish', type: 'switch', label: '發佈' },
	{ name: 'id', type: 'hidden', label: '' },
	{ name: 'CategoryId', type: 'select', label: '目錄', options: getCategories('download'),async:true},
	{ name: 'title', type: 'text', label: '標題'},
	{ name: 'description', type: 'text', label: '描述' },
];

export const DownloadFileSaveFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'type', type: 'select', label: '檔案類型',options:DownloadFileTypeOptions, gridSize:2},
	{ name: 'url', type: 'file', label: '檔案', gridSize:10 },
];
