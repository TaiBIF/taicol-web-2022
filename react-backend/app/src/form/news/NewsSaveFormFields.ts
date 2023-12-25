import { InputTextFieldProps, InputSelectFieldProps } from 'src/types';
import { getCategories } from 'src/api';

export const NewsSaveFormFields: Array<InputTextFieldProps | InputSelectFieldProps> = [
	{ name: 'publish', type: 'switch', label: '發佈' },
  { name: 'show_in_en', type: 'checkbox', label: '顯示於英文版' },
	{ name: 'show_in_zh', type: 'checkbox', label: '顯示於中文版' },
	{ name: 'id', type: 'hidden', label: '' },
	{ name: 'title', type: 'text', label: '標題' , handleOnChange: (e, getValues, setValue, onChange) => {
    const id = getValues('id')
    const newSlug = `${e.target.value.replace(/\s+/ig, '-').toLowerCase()}`
      if(!id) {setValue('slug',newSlug)}
      onChange(e.target.value)
    }
  },
  { name: 'slug', type: 'text', label: 'Slug', handleOnChange: (e, getValues, setValue, onChange) => {
      const newSlug = `${e.target.value.replace(/\s+/ig, '-').toLowerCase()}`
      onChange(newSlug)
    } 
  },
  { name: 'CategoryId', type: 'select', label: '目錄', options: getCategories('news'),async:true},
	{ name: 'publishedDate', type: 'datepicker', label: '日期' },
	{ name: 'description', type: 'editor', label: '描述' },
];
