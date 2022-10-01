// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { ApiParamsFields,ApiParamCombineUrlFields } from './ApidocFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveApidocParamsFormSchema } from './saveApidocFormSchema';
import GenerateFields from '../components/GenerateFields';
import GenerateDynamicFields from '../components/GenerateDynamicFields';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useSWRConfig } from 'swr';
import SubmitPanel from 'src/form/components/SubmitPanel';

type SaveFormValues = z.infer<typeof saveApidocParamsFormSchema>;
type FormData = {
  params: SaveFormValues[],
  combine_url: string
}
type Props = {
	defaultValues?: FormData
};

const ApidocParamsForm: React.VFC<Props> = (props) => {
	// ** State
  const router = useRouter();
  const {defaultValues} = props
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig()
	const methods = useForm<FormData>({
    defaultValues: defaultValues,
		resolver: zodResolver(saveApidocParamsFormSchema),
  });

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

  const onSubmit: SubmitHandler<FormData> = async (values) => {
		const res = await fetch('/api/admin/apidoc/params/save', {
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
          <GenerateFields fields={ApiParamCombineUrlFields}  />
          <GenerateDynamicFields dynamicFields={ApiParamsFields} name={'params'} />
          <SubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default ApidocParamsForm;
