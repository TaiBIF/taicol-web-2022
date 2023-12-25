import React from 'react';
import { Controller, useFormContext,  } from 'react-hook-form';

import Checkbox from '@mui/material/Checkbox';
import { InputCheckboxFieldProps } from 'src/types';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';

type Props = InputCheckboxFieldProps;

export const InputCheckboxField: React.VFC<Props> = ({ label, name, endAdornment, gridSize, error = false,errorMessage ,disabled = false,handleOnChange, ...props }) => {
	const {
    control,
    setValue,
    getValues,
	} = useFormContext();


  return (
    <Grid item xs={12} sm={gridSize} >
      <FormControlLabel

        control={
              <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <Checkbox
                    // fullWidth
                    disabled={disabled}
                    checked={ value == 1 ? true : false }
                    // {...props}
                    onChange={handleOnChange ? (e: React.ChangeEvent<HTMLInputElement>) => handleOnChange(e, getValues, setValue, onChange) : onChange} // send value to hook form
                    // inputRef={ref}
                    // InputProps={{
                    //   endAdornment: endAdornment,
                    // }}
                    // error={error}
                    // helperText={errorMessage}
                  />
                )}
              />
        }
        label={label}
      />
    </Grid>
	);
};
