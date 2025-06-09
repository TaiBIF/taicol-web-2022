// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { RegisterTaxonSaveFormFields } from './RegisterTaxonSaveFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateRegisterTaxonFormSchema, createRegisterTaxonFormSchema } from './saveRegisterTaxonFormSchema';
import GenerateFields from '../components/GenerateFields'
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import RegisterTaxonSubmitPanel from 'src/form/components/RegisterTaxonSubmitPanel';
import { useSWRConfig } from 'swr'

type UpdateFormValues = z.infer<typeof updateRegisterTaxonFormSchema>;
type CreateFormValues = z.infer<typeof createRegisterTaxonFormSchema>;

type Props = {
	defaultValues?: UpdateFormValues | null;
};
const SaveRegisterTaxonForm: React.VFC<Props> = (props) => {
	// ** State
	const router = useRouter();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const { mutate } = useSWRConfig()
	const methods = useForm<CreateFormValues | UpdateFormValues>({
		defaultValues: props.defaultValues ? props.defaultValues : {},
		resolver: zodResolver(props?.defaultValues?.id ? updateRegisterTaxonFormSchema : createRegisterTaxonFormSchema),
	});

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

	const onSubmit: SubmitHandler<CreateFormValues | UpdateFormValues> = async (values) => {
		const res = await fetch('/api/admin/register_taxon/save', {
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
				mutate(`/api/admin/register_taxon/info?id=${props?.defaultValues?.id}`)
			}

			router.push('/admin/register_taxon');
		}
	};

	console.log('errors', errors);

	return (
		<CardContent>
			<FormProvider {...methods}>
				<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)} id="reactRegisterTaxonForm">
					<GenerateFields fields={RegisterTaxonSaveFormFields} />
			<RegisterTaxonSubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default SaveRegisterTaxonForm;
