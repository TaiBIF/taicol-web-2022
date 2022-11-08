import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { InputCkeditorFieldProps } from 'src/types';
import FormHelperText from '@mui/material/FormHelperText';
import dynamic from "next/dynamic";
import 'suneditor/dist/css/suneditor.min.css';

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

const InputSunEditorField: React.VFC<InputCkeditorFieldProps> = ({ name,label, error = false,errorMessage , ...props }) => {
	const {
    control,
    setValue,
  } = useFormContext();

	return (
    <Grid item xs={12} sm={12} >
      <Typography variant="h6" gutterBottom component="div">{label}</Typography>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value, name, ref } }) => (
          <div className='MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 MuiGrid-grid-sm-12 css-1idn90j-MuiGrid-root h-96 w-full'>

          <SunEditor
            autoFocus={true}
            lang='en'
            setOptions={{
              showPathLabel: false,
              minHeight: '50vh',
              maxHeight: '50vh',
              placeholder: 'Enter your text here!!!',

              mode: 'classic',
              rtl: false,
              katex: 'window.katex',
              videoFileInput: false,
              tabDisable: false,
              buttonList: [
                [
                  'undo',
                  'redo',
                  'font',
                  'fontSize',
                  'formatBlock',
                  'paragraphStyle',
                  'blockquote',
                  'bold',
                  'underline',
                  'italic',
                  'strike',
                  'fontColor',
                  'hiliteColor',
                  'textStyle',
                  'removeFormat',
                  'outdent',
                  'indent',
                  'align',
                  'horizontalRule',
                  'list',
                  'lineHeight',
                  'table',
                  'link',
                  'image',
                  'video',
                  'fullScreen',
                  'showBlocks',
                  'codeView',
                  'preview',
                ],
              ],
              formats: ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
              font: [
                'Arial',
                'Calibri',
                'Comic Sans',
                'Courier',
                'Garamond',
                'Georgia',
                'Impact',
                'Lucida Console',
                'Palatino Linotype',
                'Segoe UI',
                'Tahoma',
                'Times New Roman',
                'Trebuchet MS',
              ],
            }}
            defaultValue={value}
            onChange={onChange}
            onBlur={onBlur}
          />
            {error && <FormHelperText>{errorMessage}</FormHelperText>}
          </div>
        )}
      />
    </Grid>
	);
};

export default InputSunEditorField
