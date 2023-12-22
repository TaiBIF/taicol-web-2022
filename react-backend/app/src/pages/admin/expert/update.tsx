// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** Expert Form Imports
import ExpertSaveForm from 'src/form/expert/ExpertSaveForm';
import { updateExpertFormSchema } from 'src/form/expert/saveExpertFormSchema';

// **  SWR Imports
import useSWR from 'swr';

type UpdateFormValues = z.infer<typeof updateExpertFormSchema>;

const SaveExpertPage = () => {
	// ** State
	const router = useRouter();
	const { id } = router.query;

	const { data } = useSWR<UpdateFormValues>(id ? `/api/admin/expert/info?id=${id}` : []);

	return (
		<Card>
			<CardHeader title="Expert Update" />

			<CardContent sx={{ py: 2 }}></CardContent>
			{data && <ExpertSaveForm defaultValues={data} />}
		</Card>
	);
};

export default SaveExpertPage;
