

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** System Form Imports
import UserSaveForm from 'src/form/user/UserSaveForm';

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css';

const SaveUserPage = () => {
	return (
		<Card>
			<CardHeader title="User Create" />
			<CardContent sx={{ py: 2 }}></CardContent>
			<UserSaveForm />
		</Card>
	);
};

export default SaveUserPage;
