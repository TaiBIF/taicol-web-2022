import React, { useState } from 'react';
// ** MUI Imports
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Table from 'src/table';
import useSWR, { mutate } from 'swr';
import type { GridApi,GridColDef } from '@mui/x-data-grid';
import Router from 'next/router';
import { ActionTypes } from 'src/types';

import type { ApiResponseListProps } from 'src/types';

// get head cells function with swr url
const getHeadCells = (url: string) => {
  const headCells: GridColDef[] = [
    {
      field: 'id',
      headerName: 'id',
      hide: true,
    },
    {
      field: 'title',
      headerName: 'Title',
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
      flex: 1,
      renderCell: (params) => {
        const onClick = (event: React.MouseEvent<HTMLElement>, action: ActionTypes) => {
          event.stopPropagation(); // don't select this row after clicking

          switch (action) {
            case 'update':
              Router.push(`/admin/apidoc/response/update?id=${params.row.id}`);
              break;
            case 'delete':
                if (confirm('Are you sure you want to delete this API response?')) {
                  const api: GridApi = params.api;

                  const col = api.getColumn('id')
                  const id = params.getValue(params.id,col.field)

                  fetch(`/api/admin/apidoc/response/delete?id=${id}`,
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
const ReturnResponsePage: React.FC = () => {
	const [page, setPage] = useState<number>(1);
  const GET_API_RESPONSE_LIST_URL = `/api/admin/apidoc/response?page=${page}`;
  const { data } = useSWR<ApiResponseListProps>(GET_API_RESPONSE_LIST_URL);

  // change page
  const handleChangePage = (newPage: number) => {
    setPage(newPage+1);
  }

	return (
		<Grid item xs={12}>
			<Card>
        <CardHeader title="API Response List" titleTypographyProps={{ variant: 'h6' }} action={
          <>
            <IconButton
              onClick={(e: React.MouseEvent) => Router.push('/admin/apidoc/response/create')}
              sx={{ minHeight: 0, minWidth: 0, padding: 2 }}>
              <AddIcon />
            </IconButton>
          </>
        } />

        <Table
          headCells={getHeadCells(GET_API_RESPONSE_LIST_URL)}
          rows={data?.rows || []}
          count={data?.count || 0}
          page={page}
          handleChangePage={handleChangePage}
        />
			</Card>
		</Grid>
	);
};

export default ReturnResponsePage;
