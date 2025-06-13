import React, { useState } from 'react';
// ** MUI Imports
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import Table from 'src/table';
import useSWR, { mutate } from 'swr';
import type { GridApi,GridColDef,GridSortModel } from '@mui/x-data-grid';
import Router from 'next/router';
import { ActionTypes } from 'src/types';
import SearchBar from 'src/table/components/SearchBar';

import type { RegisterTaxonDataProps, RegisterTaxonListProps } from 'src/types';
import moment from 'moment';
import { saveAs } from 'file-saver'; 


const register_type_map: {[key: number]: string}  = {
      1: '新種',
      2: '分類訂正',
      3: '漏登物種',
      4: '補充資料',
}

// 轉成 CSV 範例函式
const convertToCSV = (data: RegisterTaxonDataProps[]) => {
  const header = ['姓名', '信箱', '登錄類別', '生物類群','來源文獻/參考資料', '登錄內容簡述','已解決', '需通知', '信件已寄送', '建立日期', '更新日期'];
  const rows = data.map(item => [
    // item.id,
    item.name,
    item.email,
    register_type_map[item.register_type],
    item.bio_group,
    item.reference,
    item.description,
    item.is_solved ? '是' : '否',
    item.notify ? '是' : '否',
    item.is_sent ? '是' : '否',
    moment(item.createdAt).format('yyyy/MM/DD HH:mm:ss'),
    moment(item.updatedAt).format('yyyy/MM/DD HH:mm:ss'),
  ]);

  const csvContent = [
    header.join(','),
    ...rows.map(r => r.map(field => `"${field}"`).join(',')),
  ].join('\n');

  return csvContent;
};

const handleDownload = async () => {
  try {
    const allRows: RegisterTaxonDataProps[] = [];
    let currentPage = 1;
    let totalCount = 0;

    do {
      const url = `/api/admin/register_taxon?page=${currentPage}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('下載失敗');
      const result: RegisterTaxonListProps = await res.json();

      if (result.rows && result.rows.length > 0) {
        allRows.push(...result.rows);
      }

      totalCount = result.count || 0;
      currentPage++;

      // 假設每頁10筆，當抓取到的資料數 >= totalCount就停止
    } while (allRows.length < totalCount);

    // 轉成 CSV
    const csv = convertToCSV(allRows);

    // 產生並下載檔案
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `登錄物種清單_${moment().format('YYYYMMDD_HHmmss')}.csv`);
  } catch (error) {
    alert('下載失敗，請稍後再試');
    console.error(error);
  }
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
      field: 'name',
      headerName: '姓名',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'register_type',
      headerName: '登錄類別',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
      renderCell: (params: any) => {
      return register_type_map[params.value] || params.value;
      },

    },
    {
      field: 'bio_group',
      headerName: '生物類群',
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
          event.stopPropagation(); // don't select this row after clicking

          switch (action) {
            case 'update':
              Router.push(`/admin/register_taxon/update?id=${params.row.id}`);
              break;
            case 'delete':
                if (confirm('Are you sure you want to delete this?')) {
                  const api: GridApi = params.api;

                  const col = api.getColumn('id')
                  const id = params.getValue(params.id,col.field)

                  fetch(`/api/admin/register_taxon/delete?id=${id}`,
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
            {/* <IconButton onClick={(e) => onClick(e, 'info')} sx={{ minHeight: 0, minWidth: 0, padding: 2 }}>
              <InfoIcon />
            </IconButton> */}
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
const RegisterTaxonListPage: React.FC = () => {
	const [page, setPage] = useState<number>(1);

  const [sort, setSort] = useState<string>('desc');
  const [field, setField] = useState<string>('createdAt');

  let rows: RegisterTaxonDataProps[] = [];
  
  const [keyword, setKeyword] = useState<string>('');
  const GET_REGISTER_TAXON_LIST_URL = `/api/admin/register_taxon?page=${page}&keyword=${keyword}&sort=${sort}&field=${field}`;
  const { data } = useSWR<RegisterTaxonListProps>(GET_REGISTER_TAXON_LIST_URL);

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

      // const category = row?.Category?.name  || '';

			return {
        ...row,
        createdAt: moment(row.createdAt).format('yyyy/MM/DD HH:mm:ss'),
        updatedAt: moment(row.updatedAt).format('yyyy/MM/DD HH:mm:ss'),
        // is_solved: (row.is_solved == true) ? '是' : '否',
        // description: shortDescription(row.description, 100),
        // category: category,
			};
		});
  }

	return (
		<Grid item xs={12}>
			<Card>
        <CardHeader title="登錄物種列表" titleTypographyProps={{ variant: 'h6' }} action={
          <>
            <SearchBar handleSearch={(keyword) => setKeyword(keyword)} />
            {/* <IconButton
              onClick={(e: React.MouseEvent) => Router.push('/admin/feedback/create')}
              sx={{ minHeight: 0, minWidth: 0, padding: 2 }}>
              <AddIcon />
            </IconButton> */}
            <IconButton
              onClick={handleDownload}
              sx={{ minHeight: 0, minWidth: 0, padding: 2 }}
              title="下載清單"
            >
              <DownloadIcon />
            </IconButton>

          </>
        } />

        <Table
          headCells={getHeadCells(GET_REGISTER_TAXON_LIST_URL)}
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

export default RegisterTaxonListPage;
