// ** React Imports
import { useState, ElementType, ChangeEvent } from 'react';

// ** MUI Imports
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import CardContent from '@mui/material/CardContent';
import Button, { ButtonProps } from '@mui/material/Button';

import { SystemFormFields } from './SystemFormFields';
import type { InputTextFieldProps, InputFileFieldProps } from 'src/types';
import { InputTextField, InputFileField } from 'src/form/components/fields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TypeOf } from 'zod';
import { systemFormSchema } from './systemFormSchema';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import SubmitPanel from 'src/form/components/SubmitPanel';
type SystemInput = TypeOf<typeof systemFormSchema>;

const ImgStyled = styled('img')(({ theme }) => ({
	width: 120,
	height: 120,
	marginRight: theme.spacing(6.25),
	borderRadius: theme.shape.borderRadius,
}));

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
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
declare function isInputText(x: any): x is InputTextFieldProps;

const SystemForm: React.VFC = () => {
	// ** State
	const [openAlert, setOpenAlert] = useState<boolean>(true);
	const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');

	const router = useRouter();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const methods = useForm<SystemInput>({
		resolver: zodResolver(systemFormSchema),
	});

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

	const onSubmit: SubmitHandler<SystemInput> = (values) => {
		console.log(values);
	};

	const onChange = (file: ChangeEvent) => {
		const reader = new FileReader();
		const { files } = file.target as HTMLInputElement;
		if (files && files.length !== 0) {
			reader.onload = () => setImgSrc(reader.result as string);

			reader.readAsDataURL(files[0]);
		}
	};
	return (
		<CardContent>
			<FormProvider {...methods}>
				<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={7}>
						{SystemFormFields.map((input: InputTextFieldProps | InputFileFieldProps, index: number) => {
							switch (input.type) {
								case 'photo':
									return (
										<Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }} key={`input_${index}_${input.name}`}>
											<InputFileField {...(input as InputFileFieldProps)} />
										</Grid>
									);
									break;
								default:
									return (
										<Grid item xs={12} sm={6} key={`input_${index}_${input.name}`}>
											<InputTextField {...(input as InputTextFieldProps)} />
										</Grid>
									);
									break;
							}
						})}
						<SubmitPanel />
					</Grid>
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default SystemForm;
