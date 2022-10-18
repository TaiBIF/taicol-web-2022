// ** React Imports
import React from 'react';

// ** MUI Imports
import Paper from '@mui/material/Paper';
import type { TableRows } from 'src/types';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type Props = {
	headCells: GridColDef[];
	rows: TableRows;
	count?: number;
  page?: number;
  handleChangePage?: (newPage: number) => void;
};

const TableRecordList: React.VFC<Props> = (props) => {
  const { count, handleChangePage, rows, headCells } = props;

  const pageSize: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);
  const totalPage: number = Math.ceil(count || 0 / pageSize);

	// Avoid a layout jump when reaching the last page with empty rows.
	return (
		<Paper sx={{ width: '100%', overflow: 'hidden' }}>
			<div style={{ height: 600, width: '100%' }}>
				<DataGrid getRowHeight={() => 'auto'} rowCount={totalPage} rows={rows}  columns={headCells} pageSize={pageSize} checkboxSelection onPageChange={handleChangePage} />
			</div>
		</Paper>
	);
};

export default TableRecordList;
