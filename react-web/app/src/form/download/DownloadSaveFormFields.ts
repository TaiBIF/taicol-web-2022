import { InputTextFieldProps, InputSelectFieldProps } from 'src/types';
import {OptionProp} from 'src/types'
import { getCategories } from 'src/api';

export type DownloadSaveFields = {
	id: number;
	title: OptionProp;
	file: string;
	description: string;
	category: string;
};

export const DownloadSaveFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'publish', type: 'switch', label: '發佈' },
	{ name: 'id', type: 'hidden', label: '' },
	{ name: 'CategoryId', type: 'select', label: '目錄', options: getCategories('download'),async:true},
	{ name: 'title', type: 'text', label: '標題'},
	{ name: 'description', type: 'text', label: '描述' },
	{ name: 'file', type: 'file', label: '檔案',accept:'.pdf,csv,.doc,.docx,.xsl,.xslx' },
];
