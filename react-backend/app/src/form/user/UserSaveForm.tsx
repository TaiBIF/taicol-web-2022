// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { UserSaveFormFields } from './UserSaveFormFields';
import GenerateFields from '../components/GenerateFields'
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserFormSchema, createUserFormSchema } from './saveUserFormSchema';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { SelectChangeEvent } from '@mui/material';
import Router from 'next/router'
import { useSWRConfig } from 'swr'
import SubmitPanel from 'src/form/components/SubmitPanel';


type UpdateFormValues = z.infer<typeof updateUserFormSchema>;
type CreateFormValues = z.infer<typeof createUserFormSchema>;

type Props = {
	defaultValues?: UpdateFormValues | null;
};
const SaveUserForm: React.VFC<Props> = (props) => {
	// ** State

	const router = useRouter();
  const { mutate } = useSWRConfig()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const mode = props?.defaultValues?.id ? 'update' : 'create';
	const methods = useForm<CreateFormValues | UpdateFormValues>({
		defaultValues: props.defaultValues ? props.defaultValues : {},
		resolver: zodResolver(mode == 'update' ? updateUserFormSchema : createUserFormSchema),
  });

	const {
		handleSubmit,
		setValue,
		formState: { errors },
	} = methods;

  const onSubmit: SubmitHandler<CreateFormValues | UpdateFormValues> = async (values) => {
    // console.log('values',values)
		const res = await fetch('/api/admin/user/save', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(values),
		});

		const result = await res.json();

		if(result.status){
      enqueueSnackbar(`User ${mode == 'update' ? 'updated' : 'created'} successfully`, {
        variant: 'success',
      });

      if (props?.defaultValues?.id) {
        mutate(`/api/admin/user/info?id=${props?.defaultValues?.id}`)
      }

      Router.push('/admin/user');
    }
    else {
      enqueueSnackbar(result.error, {
        variant: 'error',
      });
    }
	};

  console.log('errors', errors);
	const handleChange = (event: SelectChangeEvent<unknown>) => {
		const { value } = event.target;
	};
	return (
		<CardContent>
			<FormProvider {...methods}>
				<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <GenerateFields fields={UserSaveFormFields} />
          <SubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default SaveUserForm;
