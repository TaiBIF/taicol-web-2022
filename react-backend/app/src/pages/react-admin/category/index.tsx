import React, { useState } from 'react';
// ** MUI Imports
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Table from 'src/table';
import useSWR from 'swr';
import type { GridApi,GridColDef } from '@mui/x-data-grid';
import Router,{useRouter} from 'next/router';
import { ActionTypes } from 'src/types';
import type { CategoryDataProps } from 'src/types';
import AddIcon from '@mui/icons-material/Add';
import {capitalize} from 'src/utils/helper';

const headCells: GridColDef[] = [
	{
		field: 'id',
		headerName: 'id',
		hide: true,
	},
	{
		field: 'name',
		headerName: 'name',
		type: 'string',
		align: 'center',
		headerAlign: 'center',
		flex: 1,
	},
	{
		field: 'sort',
		headerName: 'Sort',
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
						Router.push(`/admin/category/update?id=${params.row.id}`);
						break;
          case 'delete':
              if (confirm('Are you sure you want to delete this category?')) {
                const api: GridApi = params.api;

                const col = api.getColumn('id')
                const id = params.getValue(params.id,col.field)

                fetch(`/api/admin/category/delete?id=${id}`,
                  { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
                  .then((res) => res.json())
                  .then((result) => {
                    if (result) {
                      Router.reload()
                    }
                  });

              }
            break;
				}

				//const api: GridApi = params.api;
				//api.getAllColumns().forEach((c) => (thisRow[c.field] = params.getValue(params.id, c.field)));
				//return alert(JSON.stringify(thisRow, null, 4));
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
		},
	},
];

const CategoryListPage: React.FC = () => {
  let rows: CategoryDataProps[] = [];
  const router = useRouter();
  const {type} = router.query;
	const { data } = useSWR<CategoryDataProps[]>( type ? `/api/admin/category?type=${type}` : []);

  const title = capitalize(type as string) + ' Category List';

	if (data) {
		rows = data?.map((row) => {
			return {
				...row,
			};
		});
	}
	return (
		<Grid item xs={12}>
			<Card>
        <CardHeader title={title} titleTypographyProps={{ variant: 'h6' }} action={
          <IconButton onClick={(e:React.MouseEvent) => Router.push(`/admin/category/create?type=${type}`)} sx={{ minHeight: 0, minWidth: 0, padding: 2 }}><AddIcon/></IconButton>
        } />
				<Table headCells={headCells} rows={rows || []} />
			</Card>
		</Grid>
	);
};

export default CategoryListPage;
