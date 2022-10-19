// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { UpdateProfileFormFields } from './UserSaveFormFields';
import GenerateFields from '../components/GenerateFields'
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileFormSchema } from './saveUserFormSchema';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import dynamic from "next/dynamic";
import SubmitPanel from 'src/form/components/SubmitPanel';

const Editor = dynamic(() => import("src/form/components/fields/InputCKEditorField"), {
  ssr: false,
  loading: () => <p>Loading CKEditor...</p>,
});

type UpdateFormValues = z.infer<typeof updateProfileFormSchema>;

type Props = {
	defaultValues: UpdateFormValues;
};



const SaveProfileForm: React.VFC<Props> = (props) => {
	// ** State

	const router = useRouter();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  console.log('props data', props.defaultValues);
	const methods = useForm<UpdateFormValues>({
		defaultValues: props.defaultValues ? props.defaultValues : {},
		resolver: zodResolver(updateProfileFormSchema),
  });

	const {
		handleSubmit,
		setValue,
		formState: { errors },
	} = methods;

  const onSubmit: SubmitHandler<UpdateFormValues> = async (values) => {
    console.log('values',values)
		const res = await fetch('/api/admin/profile/save', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(values),
		});

		const result = await res.json();

		if(result.status){
      enqueueSnackbar('Profile updated successfully', {
        variant: 'success',
      });
    }
	};

	return (
		<CardContent>
			<FormProvider {...methods}>
				<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <GenerateFields fields={UpdateProfileFormFields} />
          <SubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default SaveProfileForm;
