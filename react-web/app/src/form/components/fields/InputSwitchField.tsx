import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import { InputTextFieldProps } from 'src/types';
import Grid from '@mui/material/Grid';

type Props = InputTextFieldProps;

export const InputSwitchField: React.VFC<Props> = ({ name, endAdornment, gridSize,label, ...props }) => {
	const {
    control,
		formState: { errors },
	} = useFormContext();

	return (
    <Grid item xs={12} sm={gridSize} >
			<FormControl fullWidth error={!!errors[name]}>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value = true, name, ref } }) => (
             <FormControlLabel
              value="top"
              control={<Switch
                name={name}
                checked={!!value}

                onChange={onChange}
            />}
              label={label}
              labelPlacement="start"
            />

          )}
        />
			</FormControl>
		</Grid>
	);
};
