import React, { useCallback, useEffect, useMemo, useState } from 'react';
import InputFields from './components/InputFields';
import { Box, CssBaseline, Divider, ThemeProvider, createTheme } from '@mui/material';
import './App.css';
import DaysUntil from './components/DaysUntil';
import ThemeSelector from './components/ThemeSelector';
import CalendarEvent from './components/CalendarEvent';
import Clock from './components/Clock';
import { THEMES, ThemeName } from './themes';

function App() {
	const [dateExists, setDateExists] = useState<boolean>(
		window.localStorage.getItem('target-date') !== null
	);
	const [themeName, setThemeName] = useState<ThemeName>(
		() => (window.localStorage.getItem('theme') as ThemeName) ?? 'midnight'
	);
	const [calendarCountdown, setCalendarCountdown] = useState<boolean>(
		() => window.localStorage.getItem('calendar-countdown') === 'true'
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
		setCalendarCountdown(window.localStorage.getItem('calendar-countdown') === 'true');
	}, []);

	useEffect(() => {
		window.addEventListener('days-until', handleLocalStorageCheck);
		return () => {
			window.removeEventListener('days-until', handleLocalStorageCheck);
		};
	}, [handleLocalStorageCheck]);

	const handleCalendarCountdown = useCallback(() => {
		window.localStorage.setItem('calendar-countdown', 'true');
		window.dispatchEvent(new Event('days-until'));
	}, []);

	const handleCalendarClear = useCallback(() => {
		window.localStorage.removeItem('calendar-countdown');
		window.dispatchEvent(new Event('days-until'));
	}, []);

	return (
		<ThemeProvider theme={muiTheme}>
			<CssBaseline />
			<Box
				height='100vh'
				width='100vw'
				display='flex'
				flexDirection='column'
				justifyContent='center'
				alignItems='center'
				gap={3}
				className={`background_${themeName}`}
			>
				<ThemeSelector />
				<Clock />
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
						borderRadius: { xs: '16px', md: '24px' },
						padding: { xs: '24px 20px', sm: '32px 40px', md: '36px 48px', xl: '48px 64px' },
						width: { xs: '92vw', sm: '80vw', md: 'auto' },
						maxWidth: { md: '860px', lg: 'clamp(620px, calc(-700px + 85vw), 900px)' },
						boxSizing: 'border-box',
					}}
				>
					{calendarCountdown ? (
						<CalendarEvent isFullscreen onClear={handleCalendarClear} />
					) : (
						<>
							{dateExists ? <DaysUntil /> : <InputFields onCountdownToCalendar={handleCalendarCountdown} />}
							<Divider flexItem sx={{ opacity: 0.3 }} />
							<CalendarEvent />
						</>
					)}
				</Box>
			</Box>
		</ThemeProvider>
	);
}

export default App;
