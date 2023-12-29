import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';
import { InputTextFieldProps } from 'src/types';
import Grid from '@mui/material/Grid';
import { InputTextField } from './InputTextField';

type Props = InputTextFieldProps;

export const TaxonLinkField: React.VFC<Props> = ({ name, endAdornment, gridSize, error = false,errorMessage ,disabled = false,handleOnChange, ...props }) => {
	const {
    control,
    setValue,
    getValues,
	} = useFormContext();


  return (
    <Grid item xs={12} sm={gridSize} >
      
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value, name, ref } }) => (
          <p>回饋物種編號：<a href={`${process.env.NEXT_PUBLIC_WEB_PUBLIC_DOMAIN}/taxon/` + value} target='_blank'>{value}</a> </p>
          // <TextField
          //   fullWidth
          //   disabled={disabled}
          //   value={value || ''}
          //   {...props}
          //   onChange={handleOnChange ? (e: React.ChangeEvent<HTMLInputElement>) => handleOnChange(e, getValues, setValue, onChange) : onChange} // send value to hook form
          //   inputRef={ref}
          //   InputLabelProps={{ shrink: true }}
          //   InputProps={{
          //     endAdornment: endAdornment,
          //   }}
          //   error={error}
          //   helperText={errorMessage}
          // />
        )}
      />
    </Grid>
	);
};
