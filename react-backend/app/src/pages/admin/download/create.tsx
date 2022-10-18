

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Download Form Imports
import DownloadSaveForm from 'src/form/download/DownloadSaveForm';

const SaveNewsPage = () => {
	return (
		<Card>
			<CardHeader title="Download Create" />
			<CardContent sx={{ py: 2 }}></CardContent>
			<DownloadSaveForm />
		</Card>
	);
};

export default SaveNewsPage;
