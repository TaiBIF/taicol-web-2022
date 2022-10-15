// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { ApidocInfoFields } from './ApidocFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveApidocInfoFormSchema } from './saveApidocFormSchema';
import GenerateFields from '../components/GenerateFields'
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useSWRConfig } from 'swr';
import SubmitPanel from 'src/form/components/SubmitPanel';

type SaveFormValues = z.infer<typeof saveApidocInfoFormSchema>;

type Props = {
	defaultValues?: SaveFormValues | null;
};
const ApidocInfoForm: React.VFC<Props> = (props) => {
	// ** State
	const router = useRouter();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig()
	const methods = useForm<SaveFormValues>({
		defaultValues: props.defaultValues ? props.defaultValues : {},
		resolver: zodResolver(saveApidocInfoFormSchema),
  });

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

  const onSubmit: SubmitHandler<SaveFormValues> = async (values) => {
		const res = await fetch('/api/admin/apidoc/info/save', {
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

      mutate(`/api/admin/apidoc/info`)
    }
	};

	return (
		<CardContent>
			<FormProvider {...methods}>
				<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <GenerateFields fields={ApidocInfoFields} />
          <SubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default ApidocInfoForm;
