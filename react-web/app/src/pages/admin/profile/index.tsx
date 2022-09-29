

// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** System Form Imports
import UpdateProfileForm from 'src/form/user/UpdateProfileForm';
import { updateProfileFormSchema } from 'src/form/user/saveUserFormSchema';

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css';

// **  SWR Imports
import useSWR from 'swr';

type UpdateFormValues = z.infer<typeof updateProfileFormSchema>;

const SaveUserPage = () => {
	// ** State
  const router = useRouter();
	const { data } = useSWR<UpdateFormValues>(`/api/admin/profile/info`);

	return (
		<Card>
			<CardHeader title="Profile" />

			<CardContent sx={{ py: 2 }}></CardContent>
			{data && <UpdateProfileForm defaultValues={data} />}
		</Card>
	);
};

export default SaveUserPage;
