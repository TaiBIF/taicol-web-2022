// ** MUI Imports
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Router from 'next/router';
import Divider from '@mui/material/Divider';
import React from 'react';

const SubmitPanel: React.VFC<{}> = () => {

	return (
    <Grid item xs={12} marginTop={4} textAlign="right">
      <Divider sx={{marginY:4}} />
			<Button type="submit" variant="contained" sx={{ marginRight: 3.5 }}>
				Save
			</Button>
			<Button type="reset" variant="outlined" color="secondary" onClick={() =>Router.back()}>
				Cancel
			</Button>
		</Grid>
	);
};

export default SubmitPanel;
