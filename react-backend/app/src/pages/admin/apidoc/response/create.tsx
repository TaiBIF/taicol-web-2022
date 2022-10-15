

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Apidoc Form Imports
import ApidocResponseForm from 'src/form/apidoc/ApidocResponseForm';

const CreateApiResponsePage = () => {
	return (
		<Card>
			<CardHeader title="API Response Create" />
			<CardContent sx={{ py: 2 }}></CardContent>
			<ApidocResponseForm />
		</Card>
	);
};

export default CreateApiResponsePage;
