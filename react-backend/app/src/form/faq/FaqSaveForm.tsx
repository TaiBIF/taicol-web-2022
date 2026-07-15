// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { FaqSaveFormFields } from './FaqSaveFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateFaqFormSchema, createFaqFormSchema } from './saveFaqFormSchema';
import GenerateFields from '../components/GenerateFields'
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import SubmitPanel from 'src/form/components/SubmitPanel';
import { useSWRConfig } from 'swr'

type UpdateFormValues = z.infer<typeof updateFaqFormSchema>;
type CreateFormValues = z.infer<typeof createFaqFormSchema>;

type Props = {
	defaultValues?: UpdateFormValues | null;
};

const SaveFaqForm: React.VFC<Props> = (props) => {
	// ** State
	const router = useRouter();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const { mutate } = useSWRConfig()
	const methods = useForm<CreateFormValues | UpdateFormValues>({
		defaultValues: props.defaultValues ? props.defaultValues : {},
		resolver: zodResolver(props?.defaultValues?.id ? updateFaqFormSchema : createFaqFormSchema),
	});

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

	const onSubmit: SubmitHandler<CreateFormValues | UpdateFormValues> = async (values) => {
		const res = await fetch('/api/admin/faq/save', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(values),
		});

		const result = await res.json();

		if(result.status){
		enqueueSnackbar('Success', { variant: 'success' });

		if (props?.defaultValues?.id) {
			mutate(`/api/admin/faq/info?id=${props?.defaultValues?.id}`)
		}

		router.push('/admin/faq');
		}
	};

  	console.log('errors', errors);
	return (
		<CardContent>
			<FormProvider {...methods}>
				<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
					<GenerateFields fields={FaqSaveFormFields} />
          <SubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default SaveFaqForm;
