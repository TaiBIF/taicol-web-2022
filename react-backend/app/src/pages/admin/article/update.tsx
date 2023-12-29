// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** Article Form Imports
import ArticleSaveForm from 'src/form/article/ArticleSaveForm';
import { updateArticleFormSchema } from 'src/form/article/saveArticleFormSchema';

// **  SWR Imports
import useSWR from 'swr';

type UpdateFormValues = z.infer<typeof updateArticleFormSchema>;

const SaveArticlePage = () => {
	// ** State
	const router = useRouter();
	const { id } = router.query;

	const { data } = useSWR<UpdateFormValues>(id ? `/api/admin/article/info?id=${id}` : []);

	return (
		<Card>
			<CardHeader title="主題文章更新" />

			<CardContent sx={{ py: 2 }}></CardContent>
			{data && <ArticleSaveForm defaultValues={data} />}
		</Card>
	);
};

export default SaveArticlePage;
