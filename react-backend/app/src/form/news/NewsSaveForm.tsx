// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { NewsSaveFormFields } from './NewsSaveFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateNewsFormSchema, createNewsFormSchema } from './saveNewsFormSchema';
import GenerateFields from '../components/GenerateFields'
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useSWRConfig } from 'swr'
import SubmitPanel from 'src/form/components/SubmitPanel';

type UpdateFormValues = z.infer<typeof updateNewsFormSchema>;
type CreateFormValues = z.infer<typeof createNewsFormSchema>;

type Props = {
	defaultValues?: UpdateFormValues | null;
};
const SaveNewsForm: React.VFC<Props> = (props) => {
	// ** State
  const router = useRouter();
  const { mutate } = useSWRConfig()
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const methods = useForm<CreateFormValues | UpdateFormValues>({
		defaultValues: props.defaultValues ? props.defaultValues : {},
		resolver: zodResolver(props?.defaultValues?.id ? updateNewsFormSchema : createNewsFormSchema),
  });

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

  const onSubmit: SubmitHandler<CreateFormValues | UpdateFormValues> = async (values) => {
		const res = await fetch('/api/admin/news/save', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(values),
		});

    const result = await res.json();

    if (result) {
      enqueueSnackbar('News saved successfully', {
        variant: 'success',
      });

      if (props?.defaultValues?.id) {
        mutate(`/api/admin/news/info?id=${props?.defaultValues?.id}`)
      }

      router.push('/admin/news');
    }
	};

  console.log('errors', errors);
	return (
		<CardContent>
			<FormProvider {...methods}>
				<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <GenerateFields fields={NewsSaveFormFields} />
          <SubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default SaveNewsForm;
