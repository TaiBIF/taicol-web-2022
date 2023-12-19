import { InputTextFieldProps, InputSelectFieldProps } from 'src/types';
import {OptionProp} from 'src/types'
import { getCategories } from 'src/api';
import { DownloadFileTypeOptions } from '../options';

export type DownloadSaveFields = {
	id: number;
	title: OptionProp;
	title_eng: string;
	file: string;
	type: string;
	description: string;
	description_eng: string;
	category: string;
};

export const DownloadSaveFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'publish', type: 'switch', label: '發佈' },
	{ name: 'id', type: 'hidden', label: '' },
	{ name: 'CategoryId', type: 'select', label: '目錄', options: getCategories('download'),async:true},
	{ name: 'title', type: 'text', label: '標題'},
	{ name: 'title_eng', type: 'text', label: '英文版標題' },
	{ name: 'description', type: 'text', label: '描述' },
	{ name: 'description_eng', type: 'text', label: '英文版描述' },
	{ name: 'publishedDate', type: 'datepicker', label: '日期' },
];

export const DownloadFileSaveFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'type', type: 'select', label: '檔案類型',options:DownloadFileTypeOptions, gridSize:2},
	{ name: 'url', type: 'file', label: '檔案', gridSize:10 },
];
