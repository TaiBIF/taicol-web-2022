import { InputTextFieldProps, InputSelectFieldProps } from 'src/types';
import { OptionProp } from 'src/types'
import {CategoryTypeOptions} from 'src/form/options'

export type CategorySaveFields = {
	id: number;
	type: OptionProp;
	name: string;
	sort: number;
	color?: string;
};

export const CategoryCreateFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'type', type: 'select', label: '類型', options: CategoryTypeOptions },
	{ name: 'name', type: 'text', label: '名稱'  },
	{ name: 'color', type: 'text', label: '顔色',gridSize:6  },
	{ name: 'sort', type: 'string', label: '排序',gridSize:6 },
];

export const CategoryUpdateFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'id', type: 'hidden', label: '' },
	{ name: 'type', type: 'select', label: '類型', options: CategoryTypeOptions ,disabled:true},
	{ name: 'name', type: 'text', label: '名稱'  },
	{ name: 'color', type: 'text', label: '顔色',gridSize:6  },
	{ name: 'sort', type: 'string', label: '排序',gridSize:6 },
];
