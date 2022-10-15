

// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** System Form Imports
import CategorySaveForm from 'src/form/category/CategorySaveForm';
import { updateCategoryFormSchema } from 'src/form/category/saveCategoryFormSchema';

import type { CategoryTypes } from 'src/types';

// **  SWR Imports
import useSWR from 'swr';

type UpdateFormValues = z.infer<typeof updateCategoryFormSchema>;

const SaveCategoryPage = () => {
	// ** State
	const router = useRouter();
	const { id } = router.query;

	const { data } = useSWR<UpdateFormValues>(id ? `/api/admin/category/info?id=${id}` : []);

  console.log('data', data);
	return (
		<Card>
			<CardHeader title="Category Create" />

			<CardContent sx={{ py: 2 }}></CardContent>
      {data && <CategorySaveForm defaultValues={data} type={data?.type as CategoryTypes} />}
		</Card>
	);
};

export default SaveCategoryPage;
