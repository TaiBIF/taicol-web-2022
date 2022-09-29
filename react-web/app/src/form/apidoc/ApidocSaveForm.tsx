// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { ApidocFormFields,ApiParamsFormFields } from './ApidocFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveApidocFormSchema } from './saveApidocFormSchema';
import GenerateFields from '../components/GenerateFields'
import GenerateDynamicFields from '../components/GenerateDynamicFields'
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useSWRConfig } from 'swr';
import SubmitPanel from 'src/form/components/SubmitPanel';

type SaveFormValues = z.infer<typeof saveApidocFormSchema>;

type Props = {
	defaultValues?: SaveFormValues | null;
};
const ApidocBaseForm: React.VFC<Props> = (props) => {
	// ** State
	const router = useRouter();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig()
	const methods = useForm<SaveFormValues>({
		defaultValues: props.defaultValues ? props.defaultValues : {},
		resolver: zodResolver(saveApidocFormSchema),
  });

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

  const onSubmit: SubmitHandler<SaveFormValues> = async (values) => {
		const res = await fetch('/api/admin/apidoc/save', {
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

        mutate(`/api/admin/apiinfo/info`)
    }
	};

  console.log('errors', errors);
	return (
		<CardContent>
			<FormProvider {...methods}>
				<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <GenerateFields fields={ApidocFormFields} />
          <GenerateDynamicFields dynamicFields={ApiParamsFormFields} name={'params'} />
          <SubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default ApidocBaseForm;
