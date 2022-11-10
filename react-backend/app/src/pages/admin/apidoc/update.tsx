// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import ApidocSaveForm from 'src/form/apidoc/ApidocSaveForm';

// ** Zod Imports
import { z } from 'zod';

// ** News Form Imports
import { saveApidocFormSchema } from 'src/form/apidoc/saveApidocFormSchema';


// **  SWR Imports
import useSWR from 'swr';

type SaveFormValues = z.infer<typeof saveApidocFormSchema>;

const UpdatePage = () => {
	// ** State
	const router = useRouter();

	const { data,isValidating } = useSWR<SaveFormValues>(`/api/admin/apidoc/info`);

	return (
		<Card>
			<CardHeader title="API Doc Update" />

			<CardContent sx={{ py: 2 }}></CardContent>
      {!isValidating && <ApidocSaveForm defaultValues={data} />}
		</Card>
	);
};

export default UpdatePage;
