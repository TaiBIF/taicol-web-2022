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
import { shortDescription } from 'src/utils/helper';

import type { ArticleDataProps,ArticleListProps } from 'src/types';

// get head cells function with swr url
const getHeadCells = (url: string) => {
  const headCells: GridColDef[] = [
    {
      field: 'id',
      headerName: 'id',
      hide: true,
    },
    {
      field: 'category',
      headerName: '類別',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'title',
      headerName: '標題',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'description',
      headerName: '內文',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'author',
      headerName: '作者',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'publish',
      headerName: '發布',
      type: 'boolean',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'publishedDate',
      headerName: '發布日期',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'show_in_en',
      headerName: '顯示於英文版',
      type: 'boolean',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'show_in_zh',
      headerName: '顯示於中文版',
      type: 'boolean',
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
            // case 'info':
            //   window.open (`/article/${params.row.slug}`, '_ blank');
            //   break;
            case 'update':
              Router.push(`/admin/article/update?id=${params.row.id}`);
              break;
            case 'delete':
                if (confirm('Are you sure you want to delete this article?')) {
                  const api: GridApi = params.api;

                  const col = api.getColumn('id')
                  const id = params.getValue(params.id,col.field)

                  fetch(`/api/admin/article/delete?id=${id}`,
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
const ArticleListPage: React.FC = () => {
	const [page, setPage] = useState<number>(1);

  const [sort, setSort] = useState<string>('desc');
  const [field, setField] = useState<string>('publishedDate');

  let rows: ArticleDataProps[] = [];
  const [keyword, setKeyword] = useState<string>('');
  const GET_ARTICLE_LIST_URL = `/api/admin/article?page=${page}&keyword=${keyword}&sort=${sort}&field=${field}`;
  const { data } = useSWR<ArticleListProps>(GET_ARTICLE_LIST_URL);

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
      const category = row?.Category?.name  || '';

			return {
        ...row,
        publishedDate: new Date(row.publishedDate).toISOString().split('T')[0],
        description: shortDescription(row.description, 100),
        category: category,
			};
		});
  }

	return (
		<Grid item xs={12}>
			<Card>
        <CardHeader title="主題文章列表" titleTypographyProps={{ variant: 'h6' }} action={
          <>
            <SearchBar handleSearch={(keyword) => setKeyword(keyword)} />
            <IconButton
              onClick={(e: React.MouseEvent) => Router.push('/admin/article/create')}
              sx={{ minHeight: 0, minWidth: 0, padding: 2 }}>
              <AddIcon />
            </IconButton>
          </>
        } />

        <Table
          headCells={getHeadCells(GET_ARTICLE_LIST_URL)}
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

export default ArticleListPage;
