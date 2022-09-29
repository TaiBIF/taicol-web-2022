import React, { useState } from 'react';
// ** MUI Imports
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

const dashboardPage: React.FC = () => {
	return (
		<Grid item xs={12}>
			<Card>
				<CardHeader title="Dashboard" titleTypographyProps={{ variant: 'h6' }} />
			</Card>
		</Grid>
	);
};

export default dashboardPage;
