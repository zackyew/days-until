import React, { useCallback, useEffect, useState } from 'react';
import InputFields from './components/InputFields';
import { Box, CssBaseline, Divider, ThemeProvider, createTheme } from '@mui/material';
import './App.css';
import DaysUntil from './components/DaysUntil';
import ThemeSelector from './components/ThemeSelector';
import CalendarEvent from './components/CalendarEvent';
import { ThemeName } from './themes';

const muiTheme = createTheme();

function App() {
	const [dateExists, setDateExists] = useState<boolean>(
		window.localStorage.getItem('target-date') !== null
	);
	const [themeName, setThemeName] = useState<ThemeName>(
		() => (window.localStorage.getItem('theme') as ThemeName) ?? 'mint'
	);

	const handleLocalStorageCheck = useCallback(() => {
		setDateExists(window.localStorage.getItem('target-date') !== null);
		setThemeName((window.localStorage.getItem('theme') as ThemeName) ?? 'mint');
	}, []);

	useEffect(() => {
		window.addEventListener('days-until', handleLocalStorageCheck);
		return () => {
			window.removeEventListener('days-until', handleLocalStorageCheck);
		};
	}, [handleLocalStorageCheck]);

	return (
		<ThemeProvider theme={muiTheme}>
			<CssBaseline />
			<Box
				height='100vh'
				width='100vw'
				display='flex'
				justifyContent='center'
				alignItems='center'
				className={`background_${themeName}`}
			>
				<ThemeSelector />
				<Box
					display='flex'
					flexDirection='column'
					alignItems='center'
					gap={4}
				>
					{dateExists ? <DaysUntil /> : <InputFields />}
					<Divider flexItem sx={{ opacity: 0.3 }} />
					<CalendarEvent />
				</Box>
			</Box>
		</ThemeProvider>
	);
}

export default App;
