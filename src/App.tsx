import React, { useCallback, useEffect, useMemo, useState } from 'react';
import InputFields from './components/InputFields';
import { Box, CssBaseline, Divider, ThemeProvider, createTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import './App.css';
import DaysUntil from './components/DaysUntil';
import ThemeSelector from './components/ThemeSelector';
import CalendarEvent from './components/CalendarEvent';
import Clock from './components/Clock';
import { THEMES, ThemeName } from './themes';

const PageRoot = styled(Box)({
	height: '100vh',
	width: '100vw',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
	gap: 24,
});

const GlassPanel = styled(Box, {
	shouldForwardProp: (prop) => prop !== 'cardBg',
})<{ cardBg: string }>(({ theme, cardBg }) => ({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: 32,
	background: cardBg,
	backdropFilter: 'blur(24px)',
	WebkitBackdropFilter: 'blur(24px)',
	border: '1px solid rgba(255,255,255,0.2)',
	borderRadius: '16px',
	padding: '24px 20px',
	width: '92vw',
	boxSizing: 'border-box',
	[theme.breakpoints.up('sm')]: {
		padding: '32px 40px',
		width: '80vw',
	},
	[theme.breakpoints.up('md')]: {
		padding: '36px 48px',
		width: 'auto',
		borderRadius: '24px',
		maxWidth: '860px',
	},
	[theme.breakpoints.up('lg')]: {
		maxWidth: 'clamp(620px, calc(-700px + 85vw), 900px)',
	},
	[theme.breakpoints.up('xl')]: {
		padding: '48px 64px',
	},
}));

const StyledDivider = styled(Divider)({ opacity: 0.3 });

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
	const [calendarConnected, setCalendarConnected] = useState<boolean>(false);

	useEffect(() => {
		chrome.storage.sync.get('calendarConnected', (result) => {
			setCalendarConnected(!!result.calendarConnected);
		});

		const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
			if ('calendarConnected' in changes) {
				const connected = !!changes.calendarConnected.newValue;
				setCalendarConnected(connected);
				if (!connected) {
					window.localStorage.removeItem('calendar-countdown');
					setCalendarCountdown(false);
				}
			}
		};
		chrome.storage.sync.onChanged.addListener(listener);
		return () => chrome.storage.sync.onChanged.removeListener(listener);
	}, []);

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
			<PageRoot className={`background_${themeName}`}>
				<ThemeSelector />
				<Clock />
				<GlassPanel cardBg={THEMES[themeName].cardBg}>
					{calendarCountdown ? (
						<CalendarEvent isFullscreen onClear={handleCalendarClear} />
					) : (
						<>
							{dateExists ? <DaysUntil /> : <InputFields onCountdownToCalendar={calendarConnected ? handleCalendarCountdown : undefined} />}
							<StyledDivider flexItem />
							<CalendarEvent />
						</>
					)}
				</GlassPanel>
			</PageRoot>
		</ThemeProvider>
	);
}

export default App;
