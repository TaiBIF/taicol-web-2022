import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { SxProps } from '@mui/system';
import TextField from '@mui/material/TextField';
import type { TextFieldProps } from '@mui/material';
import { InputTextFieldProps } from 'src/types';

type Props = InputTextFieldProps & TextFieldProps & SxProps;

export const InputHiddenField: React.VFC<Props> = ({ name, ...props }) => {
	const {
		control,
		formState: { errors },
	} = useFormContext();

	const errorMessage = errors?.[name]?.message?.toString() || '';

	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => <TextField fullWidth {...props} {...field} sx={{ display: 'none' }} />}
		/>
	);
};
