// ** React Imports
import React, { useState, Fragment, ChangeEvent, MouseEvent } from 'react';

// ** MUI Components
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline';
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline';
import { SxProps } from '@mui/system';

import { InputTextFieldProps, InputSelectFieldProps, InputFileFieldProps } from 'src/types';
import { InputTextField } from 'src/form/components/fields';

import { RegisterFormFields } from './RegisterFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TypeOf } from 'zod';
import { signIn } from 'next-auth/react';
import { registerFormSchema } from './registerFormSchema';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';

type RegisterInput = TypeOf<typeof registerFormSchema>;

interface State {
	password: string;
	showPassword: boolean;
}

const RegisterForm: React.VFC = () => {
	// ** States
	const [values, setValues] = useState<State>({
		password: '',
		showPassword: false,
	});
	const router = useRouter();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const methods = useForm<RegisterInput>({
		resolver: zodResolver(registerFormSchema),
	});

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

	const handleChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
		setValues({ ...values, [prop]: event.target.value });
	};
	const handleClickShowPassword = () => {
		setValues({ ...values, showPassword: !values.showPassword });
	};
	const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	const onSubmit: SubmitHandler<RegisterInput> = (values) => {
		// console.log(values);
		signIn('credentials', {
			email: values.email,
			password: values.password,
			redirect: false,
		}).then((res) => {
			const error = res?.error || '';
			if (res?.ok && !res?.error) {
				router.push('/');
			} else {
				enqueueSnackbar(error, {
					variant: 'error',
					persist: false,
				});
			}
		});
	};

	console.log('errors', errors);

	return (
		<FormProvider {...methods}>
			<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
				{RegisterFormFields.map((input: InputTextFieldProps, index: number) => {
					let endAdornment: React.ReactNode = <></>;
					const sx: SxProps = { marginBottom: 4 };

					switch (input.type) {
						case 'password':
							endAdornment = (
								<InputAdornment position="end">
									<IconButton
										edge="end"
										onClick={handleClickShowPassword}
										onMouseDown={handleMouseDownPassword}
										aria-label="toggle password visibility"
									>
										{values.showPassword ? <EyeOutline fontSize="small" /> : <EyeOffOutline fontSize="small" />}
									</IconButton>
								</InputAdornment>
							);
							break;
					}

					return (
						<InputTextField
							sx={sx}
							key={`input_${index}_${input.name}`}
							endAdornment={endAdornment}
							{...(input as InputTextFieldProps)}
						/>
					);
				})}

				<Button fullWidth size="large" variant="contained" sx={{ marginBottom: 7 }} type="submit">
					Login
				</Button>
			</form>
		</FormProvider>
	);
};

export default RegisterForm;
