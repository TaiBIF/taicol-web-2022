// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { ApiReturnParamsFields } from './ApidocFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveApidocReturnParamsFormSchema } from './saveApidocFormSchema';
import GenerateDynamicFields from '../components/GenerateDynamicFields'
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useSWRConfig } from 'swr';
import SubmitPanel from 'src/form/components/SubmitPanel';

type SaveFormValues = z.infer<typeof saveApidocReturnParamsFormSchema>;
type FormData = { returnParams: SaveFormValues[] }
type Props = {
	defaultValues?: FormData | {returnParams:[]};
};

const ApidocParamsForm: React.VFC<Props> = (props) => {
	// ** State
	const router = useRouter();
  const {defaultValues} = props
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig()
	const methods = useForm<FormData>({
    defaultValues: defaultValues ,
		resolver: zodResolver(saveApidocReturnParamsFormSchema),
  });

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

  const onSubmit: SubmitHandler<FormData> = async (values) => {
		const res = await fetch('/api/admin/apidoc/return/params/save', {
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
          <GenerateDynamicFields dynamicFields={ApiReturnParamsFields} name={'returnParams'} />
          <SubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default ApidocParamsForm;
