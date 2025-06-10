// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ** Zod Imports
import { z } from 'zod';

// ** RegisterTaxon Form Imports
import RegisterTaxonSaveForm from 'src/form/register_taxon/RegisterTaxonSaveForm';
import { updateRegisterTaxonFormSchema } from 'src/form/register_taxon/saveRegisterTaxonFormSchema';

// **  SWR Imports
import useSWR from 'swr';

import moment from 'moment';

type UpdateFormValues = z.infer<typeof updateRegisterTaxonFormSchema>;

const SaveRegisterTaxonPage = () => {
	// ** State
	const router = useRouter();
	const { id } = router.query;

	const { data } = useSWR<UpdateFormValues>(id ? `/api/admin/register_taxon/info?id=${id}` : []);

	const register_type_map: {[key: number]: string}  = {
        1: '新種',
        2: '分類訂正',
        3: '漏登物種',
        4: '補充資料',
	}

	return (
		<Card>
			<CardHeader title="登錄物種更新" />
			<CardContent sx={{ py: 2 }}></CardContent>
			<CardContent>
				<p>建立日期：{data && moment(data.createdAt).format('yyyy/MM/DD HH:mm:ss') }</p>
				<p>更新日期：{data && moment(data.updatedAt).format('yyyy/MM/DD HH:mm:ss') }</p>
				<p>需通知：{data && (data.notify == true) ? '是' : '否' }</p>
				<p>姓名：<span id="register_taxon-name">{data && data.name }</span></p>
				<p>email：<span id="register_taxon-email">{data && data.email }</span></p>				
				<p>類型：<span id="register_taxon-type">{data && register_type_map[data.register_type] }</span></p>
				<p>生物類群：<span id="register_taxon-bio_group">{data && data.bio_group }</span></p>
				<p>來源文獻/參考資料：{data && data.reference }</p>
				<p>登錄內容簡述：{data && data.description }</p>
			</CardContent>
			{data && <RegisterTaxonSaveForm defaultValues={data} />}
		</Card>
	);
};

export default SaveRegisterTaxonPage;
