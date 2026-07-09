

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Faq Form Imports
import FaqSaveForm from 'src/form/faq/FaqSaveForm';

const CreateFaqPage = () => {
	return (
		<Card>
			<CardHeader title="常見問題新增" />
			<CardContent sx={{ py: 2 }}></CardContent>
			<FaqSaveForm />
		</Card>
	);
};

export default CreateFaqPage;
