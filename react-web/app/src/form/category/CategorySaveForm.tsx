// ** MUI Imports
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

import { CategoryCreateFormFields,CategoryUpdateFormFields } from './CategorySaveFormFields';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateCategoryFormSchema, createCategoryFormSchema } from './saveCategoryFormSchema';
import GenerateFields from '../components/GenerateFields'
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { CategoryTypes } from 'src/types';
import SubmitPanel from 'src/form/components/SubmitPanel';
import {mutate} from 'swr'

type UpdateFormValues = z.infer<typeof updateCategoryFormSchema>;
type CreateFormValues = z.infer<typeof createCategoryFormSchema>;

type Props = {
  defaultValues?: UpdateFormValues | null;
  type: CategoryTypes;
};
const SaveCategoryForm: React.VFC<Props> = (props) => {
	// ** State
	const router = useRouter();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const methods = useForm<CreateFormValues | UpdateFormValues>({
		defaultValues: props.defaultValues ? props.defaultValues : {type:props.type},
		resolver: zodResolver(props?.defaultValues?.id ? updateCategoryFormSchema : createCategoryFormSchema),
  });

	const {
		handleSubmit,
		formState: { errors },
	} = methods;

  const onSubmit: SubmitHandler<CreateFormValues | UpdateFormValues> = async (values) => {
		const res = await fetch('/api/admin/category/save', {
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
      if(props?.defaultValues?.id)
       mutate(`/api/admin/category/info?id=${props?.defaultValues?.id}`);
      router.push(`/admin/category?type=${props.type}`);
    }
	};

  console.log('errors', errors);
	return (
		<CardContent>
			<FormProvider {...methods}>
				<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
					<GenerateFields fields={props?.defaultValues?.id ? CategoryUpdateFormFields : CategoryCreateFormFields} />
          <SubmitPanel />
				</form>
			</FormProvider>
		</CardContent>
	);
};

export default SaveCategoryForm;
