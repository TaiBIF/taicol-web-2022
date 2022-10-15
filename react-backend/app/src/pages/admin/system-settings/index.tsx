// ** React Imports
import { SyntheticEvent, useState } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import { styled } from '@mui/material/styles';
import MuiTab, { TabProps } from '@mui/material/Tab';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import Settings from 'mdi-material-ui/light/Settings';

// ** System Form Imports
import SystemForm from 'src/form/system/SystemForm';

const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
	[theme.breakpoints.down('md')]: {
		minWidth: 100,
	},
	[theme.breakpoints.down('sm')]: {
		minWidth: 67,
	},
}));

const TabName = styled('span')(({ theme }) => ({
	lineHeight: 1.71,
	fontSize: '0.875rem',
	marginLeft: theme.spacing(2.4),
	[theme.breakpoints.down('md')]: {
		display: 'none',
	},
}));

const SystemSettingsPage = () => {
	// ** State
	const [value, setValue] = useState<string>('system');

	const handleChange = (event: SyntheticEvent, newValue: string) => {
		setValue(newValue);
	};

	return (
		<Card>
			<CardHeader title="System Settings" />
			<CardContent>
				<TabContext value={value}>
					<TabList
						onChange={handleChange}
						aria-label="system-settings tabs"
						sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
					>
						<Tab
							value="system"
							label={
								<Box sx={{ display: 'flex', alignItems: 'center' }}>
									<Settings />
									<TabName>System</TabName>
								</Box>
							}
						/>
					</TabList>

					<TabPanel sx={{ p: 0 }} value="system">
						<SystemForm />
					</TabPanel>
				</TabContext>
			</CardContent>
		</Card>
	);
};

export default SystemSettingsPage;
