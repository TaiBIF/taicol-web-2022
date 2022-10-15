// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** News Form Imports
import NewsSaveForm from 'src/form/news/NewsSaveForm';
import { updateNewsFormSchema } from 'src/form/news/saveNewsFormSchema';


// **  SWR Imports
import useSWR from 'swr';

type UpdateFormValues = z.infer<typeof updateNewsFormSchema>;

const SaveNewsPage = () => {
	// ** State
	const router = useRouter();
	const { id } = router.query;

	const { data } = useSWR<UpdateFormValues>(id ? `/api/admin/news/info?id=${id}` : []);

	return (
		<Card>
			<CardHeader title="News Update" />

			<CardContent sx={{ py: 2 }}></CardContent>
			{data && <NewsSaveForm defaultValues={data} />}
		</Card>
	);
};

export default SaveNewsPage;
