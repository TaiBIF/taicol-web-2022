// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** Faq Form Imports
import FaqSaveForm from 'src/form/faq/FaqSaveForm';
import { updateFaqFormSchema } from 'src/form/faq/saveFaqFormSchema';

// **  SWR Imports
import useSWR from 'swr';

type UpdateFormValues = z.infer<typeof updateFaqFormSchema>;

const SaveFaqPage = () => {
	// ** State
	const router = useRouter();
	const { id } = router.query;

	const { data } = useSWR<UpdateFormValues>(id ? `/api/admin/faq/info?id=${id}` : []);

	return (
		<Card>
			<CardHeader title="常見問題更新" />

			<CardContent sx={{ py: 2 }}></CardContent>
			{data && <FaqSaveForm defaultValues={data} />}
		</Card>
	);
};

export default SaveFaqPage;
