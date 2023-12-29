

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** News Form Imports
import NewsSaveForm from 'src/form/news/NewsSaveForm';

const SaveNewsPage = () => {
	return (
		<Card>
			<CardHeader title="最新消息新增" />
			<CardContent sx={{ py: 2 }}></CardContent>
			<NewsSaveForm />
		</Card>
	);
};

export default SaveNewsPage;
