// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** Download Form Imports
import DownloadSaveForm from 'src/form/download/DownloadSaveForm';
import { updateDownloadFormSchema } from 'src/form/download/saveDownloadFormSchema';

// **  SWR Imports
import useSWR from 'swr';

type UpdateFormValues = z.infer<typeof updateDownloadFormSchema>;

const SaveDownloadPage = () => {
	// ** State
	const router = useRouter();
	const { id } = router.query;

	const { data } = useSWR<UpdateFormValues>(id ? `/api/admin/download/info?id=${id}` : []);

	return (
		<Card>
			<CardHeader title="Download Update" />

			<CardContent sx={{ py: 2 }}></CardContent>
			{data && <DownloadSaveForm defaultValues={data} />}
		</Card>
	);
};

export default SaveDownloadPage;
