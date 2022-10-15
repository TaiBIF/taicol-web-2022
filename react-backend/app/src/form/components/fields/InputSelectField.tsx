import React,{useState,useEffect} from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { SxProps } from '@mui/system';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import type { OptionProp } from 'src/types';

import type { InputSelectFieldProps } from 'src/types';

type Props = InputSelectFieldProps & SxProps;

export const InputSelectField: React.VFC<Props> = ({ name, gridSize, label, error = false,errorMessage, options,disabled = false,async = false }) => {
	const {
		control,
		formState: { errors },
  } = useFormContext();

  const [selectOptions, setSelectOptions] = useState<OptionProp[]>([]);

  useEffect(() => {
    if (async) {
      const ansycOptions = options as Promise<OptionProp[]>
      ansycOptions.then(data => setSelectOptions(data));
    }
    else setSelectOptions(options as OptionProp[]);
  },[])

	return (
    <Grid item xs={12} sm={gridSize} >
			<FormControl fullWidth error={!!errors[name]}>
				<InputLabel id="demo-simple-select-label" shrink> {label}</InputLabel>
				<Controller
					control={control}
					name={name}
					render={({ field: { onChange, onBlur, value, name, ref }  }) => (
						<Select
							fullWidth
              onChange={onChange}
              disabled={disabled}
              value={value}
						>
							{selectOptions?.map((option: OptionProp) => {
								return (
									<MenuItem value={option.value} key={`${name}-${option.value}-option`}>
										{option.label}
									</MenuItem>
								);
							})}
						</Select>
					)}
				/>
			</FormControl>
		</Grid>
	);
};
