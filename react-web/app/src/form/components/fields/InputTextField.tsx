import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';
import { InputTextFieldProps } from 'src/types';
import Grid from '@mui/material/Grid';

type Props = InputTextFieldProps;

export const InputTextField: React.VFC<Props> = ({ name, endAdornment, gridSize,disabled = false,handleOnChange, ...props }) => {
	const {
    control,
    setValue,
    getValues,
		formState: { errors },
	} = useFormContext();

	const errorMessage = errors?.[name]?.message?.toString() || '';

  return (
    <Grid item xs={12} sm={gridSize} >
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value, name, ref } }) => (
          <TextField
            fullWidth
            disabled={disabled}
            value={value || ''}
            {...props}
            onChange={handleOnChange ? (e:React.ChangeEvent<HTMLInputElement>) => handleOnChange(e,getValues,setValue,onChange) : onChange} // send value to hook form
            inputRef={ref}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: endAdornment,
            }}
            error={!!errors[name]}
            helperText={errorMessage}
          />
        )}
      />
    </Grid>
	);
};
