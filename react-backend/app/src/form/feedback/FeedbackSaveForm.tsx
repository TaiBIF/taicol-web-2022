// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { FeedbackSaveFormFields } from './FeedbackSaveFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateFeedbackFormSchema, createFeedbackFormSchema } from './saveFeedbackFormSchema';
import GenerateFields from '../components/GenerateFields'
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import FeedBackSubmitPanel from 'src/form/components/FeedBackSubmitPanel';
import { useSWRConfig } from 'swr'

type UpdateFormValues = z.infer<typeof updateFeedbackFormSchema>;
type CreateFormValues = z.infer<typeof createFeedbackFormSchema>;

type Props = {
	defaultValues?: UpdateFormValues | null;
};
const SaveFeedbackForm: React.VFC<Props> = (props) => {
	// ** State
	const router = useRouter();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const { mutate } = useSWRConfig()
	const methods = useForm<CreateFormValues | UpdateFormValues>({
		defaultValues: props.defaultValues ? props.defaultValues : {},
		resolver: zodResolver(props?.defaultValues?.id ? updateFeedbackFormSchema : createFeedbackFormSchema),
	});

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

	const onSubmit: SubmitHandler<CreateFormValues | UpdateFormValues> = async (values) => {
		const res = await fetch('/api/admin/feedback/save', {
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
				mutate(`/api/admin/feedback/info?id=${props?.defaultValues?.id}`)
			}

			router.push('/admin/feedback');
		}
	};

	console.log('errors', errors);

	return (
		<CardContent>
			<FormProvider {...methods}>
				<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)} id="reactFeedbackForm">
					<GenerateFields fields={FeedbackSaveFormFields} />
			<FeedBackSubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default SaveFeedbackForm;
