import React, { useState } from 'react';
// ** MUI Imports
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Table from 'src/table';
import useSWR, { mutate } from 'swr';
import type { GridApi,GridColDef,GridSortModel } from '@mui/x-data-grid';
import Router from 'next/router';
import { ActionTypes } from 'src/types';
import SearchBar from 'src/table/components/SearchBar';

import type { FeedbackDataProps, FeedbackListProps } from 'src/types';
import moment from 'moment';
import DownloadIcon from '@mui/icons-material/Download';
import { saveAs } from 'file-saver';
import CircularProgress from '@mui/material/CircularProgress';

const feedback_type_map: {[key: number]: string} = {
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
  11: '有效名版本紀錄',
  12: '其他分類觀點',
}

// 轉成 CSV
const convertToCSV = (data: FeedbackDataProps[]) => {
  const header = ['物種編號', '回饋者姓名', '信箱', '類型', '主旨', '錯誤描述', '來源文獻/參考資料', '已解決', '需通知', '信件已寄送', '建立日期', '更新日期'];
  const rows = data.map(item => [
    item.taxon_id,
    item.name,
    item.email,
    feedback_type_map[item.feedback_type] || item.feedback_type,
    item.title,
    item.description,
    item.reference,
    item.is_solved ? '是' : '否',
    item.notify ? '是' : '否',
    item.is_sent ? '是' : '否',
    moment(item.createdAt).format('yyyy/MM/DD HH:mm:ss'),
    moment(item.updatedAt).format('yyyy/MM/DD HH:mm:ss'),
  ]);

  // 內容的雙引號要跳脫，null/undefined 轉空字串
  const escape = (field: any) => `"${String(field ?? '').replace(/"/g, '""')}"`;

  return [
    header.join(','),
    ...rows.map(r => r.map(escape).join(',')),
  ].join('\n');
};

const handleDownload = async () => {
  const res = await fetch('/api/admin/feedback/export');
  if (!res.ok) throw new Error('下載失敗');
  const allRows: FeedbackDataProps[] = await res.json();

  const csv = convertToCSV(allRows);
  // 加 BOM 讓 Excel 正確辨識 UTF-8 中文
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `意見回饋清單_${moment().format('YYYYMMDD_HHmmss')}.csv`);
};

// get head cells function with swr url
const getHeadCells = (url: string) => {
  const headCells: GridColDef[] = [
    {
      field: 'id',
      headerName: 'id',
      hide: true,
    },
    {
      field: 'taxon_id',
      headerName: '物種編號',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'name',
      headerName: '回饋者姓名',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'title',
      headerName: '主旨',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'is_solved',
      headerName: '已解決',
      type: 'boolean',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'notify',
      headerName: '需通知',
      type: 'boolean',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'is_sent',
      headerName: '信件已寄送',
      type: 'boolean',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'createdAt',
      headerName: '建立日期',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'updatedAt',
      headerName: '更新日期',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Action',
      type: 'string',
      align: 'right',
      headerAlign: 'center',
      sortable: false,
      flex: 1,
      renderCell: (params:any) => {
        const onClick = (event: React.MouseEvent<HTMLElement>, action: ActionTypes) => {
          event.stopPropagation();

          switch (action) {
            case 'update':
              Router.push(`/admin/feedback/update?id=${params.row.id}`);
              break;
            case 'delete':
                if (confirm('Are you sure you want to delete this feedback?')) {
                  const api: GridApi = params.api;

                  const col = api.getColumn('id')
                  const id = params.getValue(params.id,col.field)

                  fetch(`/api/admin/feedback/delete?id=${id}`,
                    { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
                    .then((res) => res.json())
                    .then((result) => {
                      if (result) {
                        mutate(url);
                      }
                    });

                }
              break;
          }
        };

        return (
          <>
            <IconButton onClick={(e) => onClick(e, 'update')} sx={{ minHeight: 0, minWidth: 0, padding: 2 }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={(e) => onClick(e, 'delete')} sx={{ minHeight: 0, minWidth: 0, padding: 2 }}>
              <DeleteIcon />
            </IconButton>
          </>
        );
      }
    },
  ];

  return headCells;
}
const FeedbackListPage: React.FC = () => {
	const [page, setPage] = useState<number>(1);
  const [downloading, setDownloading] = useState<boolean>(false);

  const onDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await handleDownload();
    } catch (error) {
      alert('下載失敗，請稍後再試');
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  const [sort, setSort] = useState<string>('desc');
  const [field, setField] = useState<string>('createdAt');

  let rows: FeedbackDataProps[] = [];
  const [keyword, setKeyword] = useState<string>('');
  const GET_FEEDBACK_LIST_URL = `/api/admin/feedback?page=${page}&keyword=${keyword}&sort=${sort}&field=${field}`;
  const { data } = useSWR<FeedbackListProps>(GET_FEEDBACK_LIST_URL);

  // change page
  const handleChangePage = (newPage: number) => {
    setPage(newPage+1);
  }

  const handleSortChange = (model: GridSortModel) => {
    if (model.length > 0){
      if (model[0]['sort']) {setSort(model[0]['sort'])}
        setField(model[0]['field'])        
    }
  };


	if (data) {
    rows = data.rows.map((row) => {

			return {
        ...row,
        createdAt: moment(row.createdAt).format('yyyy/MM/DD HH:mm:ss'),
        updatedAt: moment(row.updatedAt).format('yyyy/MM/DD HH:mm:ss'),
			};
		});
  }

	return (
		<Grid item xs={12}>
			<Card>
        <CardHeader title="意見回饋列表" titleTypographyProps={{ variant: 'h6' }} action={
          <>
            <SearchBar handleSearch={(keyword) => setKeyword(keyword)} />
            <IconButton
              onClick={onDownload}
              disabled={downloading}
              sx={{ minHeight: 0, minWidth: 0, padding: 2 }}
              title={downloading ? '下載中...' : '下載清單'}
            >
              {downloading ? <CircularProgress size={24} /> : <DownloadIcon />}
            </IconButton>
          </>
        } />

        <Table
          headCells={getHeadCells(GET_FEEDBACK_LIST_URL)}
          rows={rows || []}
          count={data?.count || 0}
          page={page}
          handleChangePage={handleChangePage}
          handleSortChange={handleSortChange}
        />
			</Card>
		</Grid>
	);
};

export default FeedbackListPage;
