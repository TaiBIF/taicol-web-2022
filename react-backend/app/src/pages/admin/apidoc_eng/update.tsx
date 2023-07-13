// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import ApidocSaveForm from 'src/form/apidoc_eng/ApidocSaveForm';

// ** Zod Imports
import { z } from 'zod';

// ** News Form Imports
import { saveApidocFormSchema } from 'src/form/apidoc_eng/saveApidocFormSchema';


// **  SWR Imports
import useSWRImmutable from 'swr/immutable'

type SaveFormValues = z.infer<typeof saveApidocFormSchema>;

const UpdatePage = () => {
	// ** State
	const router = useRouter();

	const { data,isValidating } = useSWRImmutable<SaveFormValues>(`/api/admin/apidoc_eng/info`);

	return (
		<Card>
			<CardHeader title="API Doc Eng Update" />

			<CardContent sx={{ py: 2 }}></CardContent>
      {!isValidating && <ApidocSaveForm defaultValues={data} />}
		</Card>
	);
};

export default UpdatePage;
