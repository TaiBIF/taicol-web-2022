// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { ApiResponseFields } from './ApidocFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createApidocResponseFormSchema,updateApidocResponseFormSchema } from './saveApidocFormSchema';
import GenerateFields from '../components/GenerateFields'
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useSWRConfig } from 'swr';
import SubmitPanel from 'src/form/components/SubmitPanel';

type CreateFormValues = z.infer<typeof createApidocResponseFormSchema>;
type UpdateFormValues = z.infer<typeof updateApidocResponseFormSchema>;

type Props = {
	defaultValues?: UpdateFormValues | null;
};
const ApidocResponseForm: React.VFC<Props> = (props) => {
	// ** State
	const router = useRouter();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig()
	const methods = useForm<CreateFormValues | UpdateFormValues>({
		defaultValues: props.defaultValues ? props.defaultValues : {},
		resolver: zodResolver(props?.defaultValues?.id ? updateApidocResponseFormSchema : createApidocResponseFormSchema),
  });

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

  const onSubmit: SubmitHandler<CreateFormValues | UpdateFormValues> = async (values) => {
		const res = await fetch('/api/admin/apidoc/response/save', {
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

      mutate(`/api/admin/apiinfo/response/info`)
      router.push('/admin/apidoc/response');
    }
	};

	return (
		<CardContent>
			<FormProvider {...methods}>
        <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <GenerateFields fields={ApiResponseFields} />
          <SubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default ApidocResponseForm;
