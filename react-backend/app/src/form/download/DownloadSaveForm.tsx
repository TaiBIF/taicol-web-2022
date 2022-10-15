// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { DownloadSaveFormFields } from './DownloadSaveFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateDownloadFormSchema, createDownloadFormSchema } from './saveDownloadFormSchema';
import GenerateFields from '../components/GenerateFields'
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useSWRConfig } from 'swr'
import SubmitPanel from 'src/form/components/SubmitPanel';

type UpdateFormValues = z.infer<typeof updateDownloadFormSchema>;
type CreateFormValues = z.infer<typeof createDownloadFormSchema>;

type Props = {
	defaultValues?: UpdateFormValues | null;
};
const SaveDownloadForm: React.VFC<Props> = (props) => {
	// ** State
	const router = useRouter();
  const { mutate } = useSWRConfig()
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const methods = useForm<CreateFormValues | UpdateFormValues>({
		defaultValues: props.defaultValues ? props.defaultValues : {},
		resolver: zodResolver(props?.defaultValues?.id ? updateDownloadFormSchema : createDownloadFormSchema),
  });

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

  const onSubmit: SubmitHandler<CreateFormValues | UpdateFormValues> = async (values) => {
		const res = await fetch('/api/admin/download/save', {
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

      mutate(`/api/admin/download`)
      router.push('/admin/download');
    }
	};

  console.log('errors', errors);
	return (
		<CardContent>
			<FormProvider {...methods}>
				<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
					<GenerateFields fields={DownloadSaveFormFields} />
          <SubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default SaveDownloadForm;
