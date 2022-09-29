// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** Article Form Imports
import ApidocSaveForm from 'src/form/apidoc/ApidocSaveForm';
import { saveApidocFormSchema } from 'src/form/apidoc/saveApidocFormSchema';

// **  SWR Imports
import useSWR from 'swr';

type UpdateFormValues = z.infer<typeof saveApidocFormSchema>;

const SaveArticlePage = () => {
	// ** State
	const router = useRouter();
	const { id } = router.query;

	const { data } = useSWR<UpdateFormValues>(id ? `/api/admin/apidoc/info` : []);

	return (
		<Card>
			<CardHeader title="API Document Update" />

			<CardContent sx={{ py: 2 }}></CardContent>
			<ApidocSaveForm defaultValues={data} />
		</Card>
	);
};

export default SaveArticlePage;
