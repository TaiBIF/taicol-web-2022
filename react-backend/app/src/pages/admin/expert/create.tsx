

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Expert Form Imports
import ExpertSaveForm from 'src/form/expert/ExpertSaveForm';

const SaveExpertPage = () => {
	return (
		<Card>
			<CardHeader title="Expert Create" />
			<CardContent sx={{ py: 2 }}></CardContent>
			<ExpertSaveForm />
		</Card>
	);
};

export default SaveExpertPage;
