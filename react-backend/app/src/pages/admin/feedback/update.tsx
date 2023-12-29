// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** Feedback Form Imports
import FeedbackSaveForm from 'src/form/feedback/FeedbackSaveForm';
import { updateFeedbackFormSchema } from 'src/form/feedback/saveFeedbackFormSchema';

// **  SWR Imports
import useSWR from 'swr';

import moment from 'moment';

type UpdateFormValues = z.infer<typeof updateFeedbackFormSchema>;

const SaveFeedbackPage = () => {
	// ** State
	const router = useRouter();
	const { id } = router.query;

	const { data } = useSWR<UpdateFormValues>(id ? `/api/admin/feedback/info?id=${id}` : []);

	const feedback_type_map: {[key: number]: string}  = {
        1: '學名和中文名',
        2: '照片',
        3: '分類資訊',
        4: '分類階層',
        5: '物種資訊',
        6: '學名變遷',
        7: '文獻',
        8: '專家',
        9: '相關連結',
        10: '變更歷史',
        11: '有效名版本紀錄'
	}

	return (
		<Card>
			<CardHeader title="意見回饋更新" />
			<CardContent sx={{ py: 2 }}></CardContent>
			<CardContent>
				<p>建立日期：{data && moment(data.createdAt).format('yyyy/MM/DD HH:mm:ss') }</p>
				<p>更新日期：{data && moment(data.updatedAt).format('yyyy/MM/DD HH:mm:ss') }</p>
				<p>需通知：{data && (data.notify == true) ? '是' : '否' }</p>
				<p>姓名：<span id="feedback-name">{data && data.name }</span></p>
				<p>email：<span id="feedback-email">{data && data.email }</span></p>				
				<p>回饋物種編號：<a target="_blank" href={data && process.env.NEXT_PUBLIC_WEB_PUBLIC_DOMAIN + "/taxon/" + data.taxon_id}>{data && data.taxon_id }</a></p>
				<p>類型：{data && feedback_type_map[data.feedback_type] }</p>
				<p>主旨：{data && data.title }</p>
				<p>錯誤描述：{data && data.description }</p>
				<p>來源文獻/參考資料：{data && data.reference }</p>
			</CardContent>
			{data && <FeedbackSaveForm defaultValues={data} />}
		</Card>
	);
};

export default SaveFeedbackPage;
