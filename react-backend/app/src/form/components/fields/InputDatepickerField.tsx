import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import { Dayjs } from 'dayjs';
import { InputTextFieldProps } from 'src/types';
import Grid from '@mui/material/Grid';
import moment, { now } from 'moment';

type Props = InputTextFieldProps;

export const InputDatepickerField: React.VFC<Props> = ({ name, endAdornment, gridSize, error = false,errorMessage ,disabled = false, ...props }) => {
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
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={value || ''}
              onChange={(value) => {
                onChange((value as Dayjs).format('YYYY-MM-DD'));
              }} // send value to hook form
              inputFormat="YYYY-MM-DD"
              renderInput={(params) => <TextField
                {...params}
                error={error}
              helperText={errorMessage}
              />}
              />
          </LocalizationProvider>

        )}
      />
    </Grid>
	);
};
