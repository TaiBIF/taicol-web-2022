// ** React Imports
import React from 'react';

// ** MUI Imports
import Paper from '@mui/material/Paper';
import type { TableRows } from 'src/types';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { useState } from 'react'

type Props = {
	headCells: GridColDef[];
	rows: TableRows;
	count?: number;
  page?: number;
  handleChangePage?: (newPage: number) => void;
  handleSortChange?: (model: GridSortModel) => void;
};

const TableRecordList: React.VFC<Props> = (props) => {
  const { count, handleChangePage, handleSortChange, rows, headCells } = props;

  const pageSize: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);
  const totalPage: number = Math.ceil(count || 0 / pageSize);


  // const [sortModel, setSortModel] = useState<GridSortModel>([
  //   {
  //       field: 'created',
  //       sort: 'desc',
  //   },
  // ]);

// const handleSortChange = (model: GridSortModel) => {
//     console.log(model)
//     /* if statement to prevent the infinite loop by confirming model is 
//      different than the current sortModel state */
//     if (JSON.stringify(model) !== JSON.stringify(sortModel)) {
//         setSortModel(model);
//     }
// };

	// Avoid a layout jump when reaching the last page with empty rows.
	return (
		<Paper sx={{ width: '100%', overflow: 'hidden' }}>
			<div style={{ height: 600, width: '100%' }}>
        <DataGrid disableColumnFilter
          getRowHeight={() => 'auto'}
          rowCount={totalPage}
          rows={rows}
          columns={headCells}
          pageSize={pageSize}
          paginationMode="server"
          onPageChange={handleChangePage} 
          sortingMode="server"
          onSortModelChange={handleSortChange}
          />
			</div>
		</Paper>
	);
};

export default TableRecordList;
