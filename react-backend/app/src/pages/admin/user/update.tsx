

// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** System Form Imports
import UserSaveForm from 'src/form/user/UserSaveForm';
import { updateUserFormSchema } from 'src/form/user/saveUserFormSchema';

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css';

// **  SWR Imports
import useSWR from 'swr';

type UpdateFormValues = z.infer<typeof updateUserFormSchema>;

const SaveUserPage = () => {
	// ** State
	const router = useRouter();
	const { id } = router.query;

	const { data } = useSWR<UpdateFormValues>(id ? `/api/admin/user/info?id=${id}` : []);

	return (
		<Card>
			<CardHeader title="User Create" />

			<CardContent sx={{ py: 2 }}></CardContent>
			{data && <UserSaveForm defaultValues={data} />}
		</Card>
	);
};

export default SaveUserPage;
