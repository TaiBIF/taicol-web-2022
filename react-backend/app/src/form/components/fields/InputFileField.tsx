import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { SxProps } from '@mui/system';

import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Button, { ButtonProps } from '@mui/material/Button';
import type { InputTextFieldProps } from 'src/types';

type Props = {
  accept?: string;
  gridSize?: number;
  multiple?: boolean;
} & InputTextFieldProps &
	SxProps;

const ImgStyled = styled('img')(({ theme }) => ({
	width: 300,
	marginTop: theme.spacing(6.25),
	borderRadius: theme.shape.borderRadius,
}));

const ButtonStyled = styled(Button)<ButtonProps & { component?: React.ElementType; htmlFor?: string }>(({ theme }) => ({
	[theme.breakpoints.down('sm')]: {
		width: '100%',
		textAlign: 'center',
	},
}));

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
	marginLeft: theme.spacing(4.5),
	[theme.breakpoints.down('sm')]: {
		width: '100%',
		marginLeft: 0,
		textAlign: 'center',
		marginTop: theme.spacing(4),
	},
}));

export const InputFileField: React.VFC<Props> = ({ gridSize, error = false,errorMessage,multiple = false, ...props }) => {
	const {
    control,
    setValue,
    getValues,
		formState: { errors },
  } = useFormContext();

  console.log('getValues',getValues(props.name))


	const [uploadFiles, setUploadFiles] = useState<string[]>(multiple ? getValues(props.name) : [getValues(props.name)]);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();

    if (e.target.files) {
      formData.append('file', e.target.files[0]);

      fetch(
        '/api/admin/upload',
        {
          method: 'POST',
          body: formData,
        }
      )
        .then((response) => response.json())
        .then((result) => {
          if (result.uploaded) {
            if (multiple) {
            const newUploadFiles = [...uploadFiles, result.url];
            setUploadFiles(newUploadFiles );
            setValue(`${props.name}` , newUploadFiles);

            }
            else {
              setUploadFiles([result.url]);
              setValue(`${props.name}`, result.url);
            }
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
	};

	return (
    <Grid item xs={12} sm={gridSize} >
    <Grid container>
    <Grid item xs={12} sm={4} >
			<FormControl fullWidth error={!!errors[props.name]}>
        <Box>
          <ButtonStyled component="label" variant="contained" htmlFor={`upload-image-${props.name}`}>
            {props.label}
            <Controller
              control={control}
              name={props.name}
              render={({ field }) => (
                <input
                  hidden
                  type="file"
                  onChange={onChange}
                  accept={props.accept ? props.accept : ""}
                  id={`upload-image-${props.name}`}
                />
              )}
            />
            {error && <FormHelperText>{errorMessage}</FormHelperText>}
          </ButtonStyled>
          <ResetButtonStyled color="error" variant="outlined" onClick={() => setUploadFiles([])}>
            Reset
          </ResetButtonStyled>
        </Box>
        {props.accept && <Typography mt={4}>{props.accept}</Typography>}


        </FormControl>
		    </Grid>
        <Grid item xs={12} sm={8} style={{wordBreak:'break-all'}} >
          {uploadFiles && uploadFiles.map((file: string, index: number) => {
            const regex = /(.png|.gif|.jpg|.webp|.jpeg)/ig
            const key = `uploda-file-${index}`
            return regex.test(file) ? <ImgStyled key={key} src={file}/> :
              <Typography key={key} mt={4}><a href={file} download>{file}</a></Typography>
          })}
		    </Grid>
		  </Grid>
		</Grid>
	);
};
