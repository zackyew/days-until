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
	const [dateExists, setDateExists] = useState<boolean>(false);
	const [themeName, setThemeName] = useState<ThemeName>('midnight');
	const [calendarCountdown, setCalendarCountdown] = useState<boolean>(false);
	const [calendarConnected, setCalendarConnected] = useState<boolean>(false);

	useEffect(() => {
		const MIGRATE_KEYS = ['target-date', 'event-name', 'theme', 'calendar-countdown'] as const;

		chrome.storage.sync.get(
			[...MIGRATE_KEYS, 'calendarConnected'],
			(result) => {
				// One-time migration: copy any localStorage values not yet in sync storage
				const toMigrate: Record<string, string> = {};
				for (const key of MIGRATE_KEYS) {
					if (result[key] === undefined) {
						const local = window.localStorage.getItem(key);
						if (local !== null) toMigrate[key] = local;
					}
				}
				if (Object.keys(toMigrate).length > 0) {
					chrome.storage.sync.set(toMigrate, () => {
						for (const key of Object.keys(toMigrate)) {
							window.localStorage.removeItem(key);
						}
					});
				}

				const merged = { ...toMigrate, ...result };
				setDateExists(!!merged['target-date']);
				setThemeName((merged['theme'] as ThemeName) ?? 'midnight');
				setCalendarCountdown(merged['calendar-countdown'] === 'true' || merged['calendar-countdown'] === true);
				setCalendarConnected(!!result.calendarConnected);
			}
		);

		const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
			if ('target-date' in changes) {
				setDateExists(!!changes['target-date'].newValue);
			}
			if ('theme' in changes) {
				setThemeName((changes['theme'].newValue as ThemeName) ?? 'midnight');
			}
			if ('calendar-countdown' in changes) {
				setCalendarCountdown(!!changes['calendar-countdown'].newValue);
			}
			if ('calendarConnected' in changes) {
				const connected = !!changes.calendarConnected.newValue;
				setCalendarConnected(connected);
				if (!connected) {
					chrome.storage.sync.remove('calendar-countdown');
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

	const handleSelectTheme = useCallback((name: ThemeName) => {
		chrome.storage.sync.set({ theme: name });
	}, []);

	const handleCalendarCountdown = useCallback(() => {
		chrome.storage.sync.set({ 'calendar-countdown': true });
	}, []);

	const handleCalendarClear = useCallback(() => {
		chrome.storage.sync.remove('calendar-countdown');
	}, []);

	return (
		<ThemeProvider theme={muiTheme}>
			<CssBaseline />
			<PageRoot className={`background_${themeName}`}>
				<ThemeSelector selected={themeName} onSelect={handleSelectTheme} />
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
