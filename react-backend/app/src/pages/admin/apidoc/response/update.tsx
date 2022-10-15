// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** Apidoc Form Imports
import ApidocResponseForm from 'src/form/apidoc/ApidocResponseForm';
import { updateApidocResponseFormSchema } from 'src/form/apidoc/saveApidocFormSchema';

// **  SWR Imports
import useSWR from 'swr';

type UpdateFormValues = z.infer<typeof updateApidocResponseFormSchema>;

const UpdateApiResponsePage = () => {
	// ** State
	const router = useRouter();
	const { id } = router.query;

	const { data } = useSWR<UpdateFormValues>(id ? `/api/admin/apidoc/response/info?id=${id}` : []);

	return (
		<Card>
			<CardHeader title="Article Update" />

			<CardContent sx={{ py: 2 }}></CardContent>
			{data && <ApidocResponseForm defaultValues={data} />}
		</Card>
	);
};

export default UpdateApiResponsePage;
