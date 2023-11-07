// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** Feedback Form Imports
import FeedbackSaveForm from 'src/form/feedback/FeedbackSaveForm';
import { updateFeedbackFormSchema } from 'src/form/feedback/saveFeedbackFormSchema';

// **  SWR Imports
import useSWRImmutable from 'swr/immutable'

type UpdateFormValues = z.infer<typeof updateFeedbackFormSchema>;

const SaveFeedbackPage = () => {
	// ** State
	const router = useRouter();
	const { id } = router.query;

	const { data } = useSWRImmutable<UpdateFormValues>(id ? `/api/admin/feedback/info?id=${id}` : []);

	return (
		<Card>
			<CardHeader title="Feedback Update" />

			<CardContent sx={{ py: 2 }}></CardContent>
			{data && <FeedbackSaveForm defaultValues={data} />}
		</Card>
	);
};

export default SaveFeedbackPage;
