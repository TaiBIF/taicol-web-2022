// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { ArticleSaveFormFields } from './ArticleSaveFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateArticleFormSchema, createArticleFormSchema } from './saveArticleFormSchema';
import GenerateFields from '../components/GenerateFields'
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import SubmitPanel from 'src/form/components/SubmitPanel';
import { useSWRConfig } from 'swr'

type UpdateFormValues = z.infer<typeof updateArticleFormSchema>;
type CreateFormValues = z.infer<typeof createArticleFormSchema>;

type Props = {
	defaultValues?: UpdateFormValues | null;
};
const SaveArticleForm: React.VFC<Props> = (props) => {
	// ** State
	const router = useRouter();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig()
	const methods = useForm<CreateFormValues | UpdateFormValues>({
		defaultValues: props.defaultValues ? props.defaultValues : {publishedDate: new Date()},
		resolver: zodResolver(props?.defaultValues?.id ? updateArticleFormSchema : createArticleFormSchema),
  });

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

  const onSubmit: SubmitHandler<CreateFormValues | UpdateFormValues> = async (values) => {
		const res = await fetch('/api/admin/article/save', {
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
        mutate(`/api/admin/article/info?id=${props?.defaultValues?.id}`)
      }

      router.push('/admin/article');
    }
	};

  console.log('errors', errors);
	return (
		<CardContent>
			<FormProvider {...methods}>
				<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
					<GenerateFields fields={ArticleSaveFormFields} />
          <SubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default SaveArticleForm;
