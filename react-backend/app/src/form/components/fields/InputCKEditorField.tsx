import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import Editor from '../../../lib/ckeditor5/ckeditor';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { InputCkeditorFieldProps } from 'src/types';
import FormHelperText from '@mui/material/FormHelperText';

const InputCKEditorField: React.VFC<InputCkeditorFieldProps> = ({ name,label, error = false,errorMessage , ...props }) => {
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
            <CKEditor
              onReady={(editor: any) => {
                  // You can store the "editor" and use when it is needed.
                  // console.log("Editor is ready to use!", editor);
                  editor.editing.view.change((writer:any) => {
                  writer.setStyle(
                      "height",
                      "400px",
                      editor.editing.view.document.getRoot()
                  );
                  });
              }}
              editor={ Editor }
              data={value}
              onChange={(event, editor) => {
                const data = editor.getData()
                onChange(data)
              }}
              config={{
              ckfinder: {
                  // Upload the images to the server using the CKFinder QuickUpload command.
                  uploadUrl: '/api/admin/upload'
              },


              language: 'zh',
              image: {
                  toolbar: [
                  'imageTextAlternative',
                  'imageStyle:full',
                  'imageStyle:side'
                  ]
              },
              table: {
                contentToolbar: [
                  'tableColumn',
                  'tableRow',
                  'mergeTableCells'
                ]
              },
              placeholder: 'Click here to start typing'
            }}
            />
            {error && <FormHelperText>{errorMessage}</FormHelperText>}
          </div>
        )}
      />
    </Grid>
	);
};

export default InputCKEditorField
