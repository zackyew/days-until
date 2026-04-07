import React, { useCallback, useEffect, useMemo, useState } from 'react';
import InputFields from './components/InputFields';
import { Box, CssBaseline, Divider, ThemeProvider, createTheme } from '@mui/material';
import './App.css';
import DaysUntil from './components/DaysUntil';
import ThemeSelector from './components/ThemeSelector';
import CalendarEvent from './components/CalendarEvent';
import { THEMES, ThemeName } from './themes';

function App() {
	const [dateExists, setDateExists] = useState<boolean>(
		window.localStorage.getItem('target-date') !== null
	);
	const [themeName, setThemeName] = useState<ThemeName>(
		() => (window.localStorage.getItem('theme') as ThemeName) ?? 'midnight'
	);

	const muiTheme = useMemo(
		() => createTheme({
			palette: { mode: THEMES[themeName].mode },
			typography: { fontFamily: "'DM Sans', sans-serif" },
		}),
		[themeName]
	);

	const handleLocalStorageCheck = useCallback(() => {
		setDateExists(window.localStorage.getItem('target-date') !== null);
		setThemeName((window.localStorage.getItem('theme') as ThemeName) ?? 'midnight');
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
					sx={{
						background: THEMES[themeName].cardBg,
						backdropFilter: 'blur(24px)',
						WebkitBackdropFilter: 'blur(24px)',
						border: '1px solid rgba(255,255,255,0.2)',
						borderRadius: '24px',
						padding: '48px 64px',
					}}
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
