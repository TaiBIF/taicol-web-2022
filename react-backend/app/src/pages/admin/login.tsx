// ** MUI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import MuiCard, { CardProps } from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout';

// ** Forms Imports
import LoginForm from 'src/form/auth/LoginForm';

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
	[theme.breakpoints.up('sm')]: { width: '28rem' },
}));

const loginPage = () => {
	// ** Hook
	const theme = useTheme();

	return (
		<Box className="content-center">
			<Card sx={{ zIndex: 1 }}>
				<CardContent sx={{ padding: (theme) => `${theme.spacing(12, 9, 7)} !important` }}>
					<Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<img src='/images/logo.svg'/>
					</Box>
					<Box sx={{ mb: 6 }}>
						<Typography variant="h5" sx={{ fontWeight: 600, marginBottom: 1.5 }}>
							Adventure starts here 🚀
						</Typography>
						<Typography variant="body2">Make your app management easy and fun!</Typography>
					</Box>
					<LoginForm />
				</CardContent>
      </Card>
		</Box>
	);
};

loginPage.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>;

export default loginPage;
