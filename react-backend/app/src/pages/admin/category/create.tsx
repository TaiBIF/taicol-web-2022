

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import type { CategoryTypes } from 'src/types';

// ** System Form Imports
import CategorySaveForm from 'src/form/category/CategorySaveForm';

// ** import useRouter
import { useRouter } from 'next/router';

const SaveCategoryPage = () => {
  const router = useRouter();

  // get type from router
  const  type:CategoryTypes = router?.query?.type  ? router.query.type as CategoryTypes  : 'news';

	return (
		<Card>
			<CardHeader title="Category Create" />
			<CardContent sx={{ py: 2 }}></CardContent>
      {<CategorySaveForm type={type} />}
		</Card>
	);
};

export default SaveCategoryPage;
