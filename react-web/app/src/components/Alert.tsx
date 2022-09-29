// ** React Imports
import React from 'react';

// ** MUI Imports
import Grid from '@mui/material/Grid';
import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';

// ** Icons Imports
import Close from 'mdi-material-ui/Close';

interface Props {
	severity: 'warning' | 'success' | 'info' | 'error';
	onClose: () => void;
	message: string;
	children: React.ReactNode;
}

export const Alert: React.FC<Props> = (props) => {
	return (
		<Grid item xs={12} sx={{ mb: 3 }}>
			<MuiAlert
				severity={props.severity}
				sx={{ '& a': { fontWeight: 400 } }}
				action={
					<IconButton size="small" color="inherit" aria-label="close" onClick={props.onClose}>
						<Close fontSize="inherit" />
					</IconButton>
				}
			>
				<AlertTitle>Your email is not confirmed. Please check your inbox.</AlertTitle>
				{props.children}
			</MuiAlert>
		</Grid>
	);
};
