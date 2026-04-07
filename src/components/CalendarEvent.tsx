import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Link, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import dayjs from 'dayjs';
import {
	CalendarEventItem,
	disconnectCalendar,
	fetchNextEvent,
	getAuthToken,
} from '../services/googleCalendar';
import { formatTimeUntil } from '../utils/time';

type Status = 'disconnected' | 'loading' | 'connected' | 'error';

const REFRESH_INTERVAL_MS = 60_000;

function toGenericError(err: unknown): string {
	const msg = err instanceof Error ? err.message : String(err);
	if (/auth|token|identity|OAuth/i.test(msg)) return 'Authentication error';
	if (/403|permission|forbidden/i.test(msg)) return 'Permission denied';
	if (/4\d\d/.test(msg)) return 'Request error';
	if (/5\d\d|server/i.test(msg)) return 'Server error';
	if (/network|fetch|failed to fetch/i.test(msg)) return 'Network error';
	return 'Unknown error';
}

function isUrl(str: string): boolean {
	try {
		const url = new URL(str);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}

function formatEventDateTime(start: CalendarEventItem['start'], end: CalendarEventItem['end']): string {
	if (start.dateTime) {
		const startStr = dayjs(start.dateTime).format('ddd, MMM D · h:mm A');
		const endStr = end.dateTime ? dayjs(end.dateTime).format('h:mm A') : null;
		return endStr ? `${startStr} – ${endStr}` : startStr;
	}
	if (start.date) return dayjs(start.date).format('ddd, MMM D');
	return '';
}

interface Props {
	isFullscreen?: boolean;
	onClear?: () => void;
}

const CalendarEvent = ({ isFullscreen = false, onClear }: Props) => {
	const [status, setStatus] = useState<Status>('loading');
	const [event, setEvent] = useState<CalendarEventItem | null>(null);
	const [noEvents, setNoEvents] = useState(false);
	const [errorDetail, setErrorDetail] = useState<string>('');

	const loadEvent = useCallback(async () => {
		try {
			const next = await fetchNextEvent();
			setEvent(next);
			setNoEvents(next === null);
			setStatus('connected');
		} catch (err) {
			console.error('[CalendarEvent] loadEvent failed:', err);
			setErrorDetail(toGenericError(err));
			setStatus('error');
		}
	}, []);

	useEffect(() => {
		chrome.storage.sync.get('calendarConnected', (result) => {
			if (result.calendarConnected) {
				loadEvent();
			} else {
				setStatus('disconnected');
			}
		});
	}, [loadEvent]);

	useEffect(() => {
		if (status !== 'connected') return;
		const interval = setInterval(loadEvent, REFRESH_INTERVAL_MS);
		return () => clearInterval(interval);
	}, [status, loadEvent]);

	const handleConnect = useCallback(async () => {
		setStatus('loading');
		try {
			await getAuthToken(true);
			await chrome.storage.sync.set({ calendarConnected: true });
			await loadEvent();
		} catch (err) {
			console.error('[CalendarEvent] handleConnect failed:', err);
			setErrorDetail(toGenericError(err));
			setStatus('error');
		}
	}, [loadEvent]);

	const handleDisconnect = useCallback(async () => {
		await disconnectCalendar();
		setEvent(null);
		setNoEvents(false);
		setStatus('disconnected');
	}, []);

	const eventStart = event?.start.dateTime ?? event?.start.date;
	const callUrl = event?.hangoutLink ?? (event?.location && isUrl(event.location) ? event.location : null);

	return (
		<Box
			display='flex'
			flexDirection='column'
			alignItems='center'
			gap={isFullscreen ? 2 : 0.5}
			sx={{ opacity: isFullscreen ? 1 : 0.75 }}
		>
			{status === 'loading' && <CircularProgress size={16} />}

			{status === 'disconnected' && (
				<Button variant='text' size='small' onClick={handleConnect} sx={{ opacity: 0.8 }}>
					Connect Google Calendar
				</Button>
			)}

			{status === 'connected' && noEvents && (
				<Typography variant='body1'>No upcoming events</Typography>
			)}

			{status === 'connected' && event && eventStart && (
				<>
					<Box display='flex' alignItems='center' gap={0.5}>
						<Typography variant={isFullscreen ? 'h1' : 'h5'} fontWeight={isFullscreen ? 400 : 500} sx={isFullscreen ? { opacity: 0.85, letterSpacing: '0.01em' } : {}}>
							{event.summary}
						</Typography>
						{callUrl && (
							<IconButton
								component='a'
								href={callUrl}
								target='_blank'
								rel='noopener noreferrer'
								sx={isFullscreen ? { padding: '6px' } : { padding: '4px' }}
							>
								<OpenInNewIcon sx={{ fontSize: isFullscreen ? '2rem' : '1.1rem' }} />
							</IconButton>
						)}
					</Box>

					{isFullscreen ? (
						<Typography variant='h2' fontWeight={400} sx={{ opacity: 0.85, fontVariantNumeric: 'tabular-nums' }}>
							{formatTimeUntil(eventStart)}
						</Typography>
					) : (
						<Typography variant='body1' sx={{ opacity: 0.75 }}>
							{formatTimeUntil(eventStart)}
						</Typography>
					)}

					<Typography variant={isFullscreen ? 'body1' : 'h6'} fontWeight={400} sx={{ opacity: isFullscreen ? 0.55 : 1 }}>
						{formatEventDateTime(event.start, event.end)}
					</Typography>

					{event.location && !isUrl(event.location) && (
						<Typography variant='body1' sx={{ opacity: 0.75 }}>
							{event.location}
						</Typography>
					)}

					{isFullscreen ? (
						<Button variant='outlined' onClick={onClear} sx={{ mt: 2 }}>
							Clear
						</Button>
					) : (
						<Link component='button' variant='body2' onClick={handleDisconnect} sx={{ mt: 0.5, cursor: 'pointer', opacity: 0.75 }}>
							Disconnect calendar
						</Link>
					)}
				</>
			)}

			{status === 'error' && (
				<Box display='flex' flexDirection='column' alignItems='center' gap={0.5}>
					<Box display='flex' alignItems='center' gap={1}>
						<Typography variant='body1'>Could not load calendar</Typography>
						<Link component='button' variant='body2' onClick={loadEvent} sx={{ cursor: 'pointer' }}>
							Retry
						</Link>
					</Box>
					{errorDetail && (
						<Typography variant='body2' sx={{ opacity: 0.6 }}>
							{errorDetail}
						</Typography>
					)}
				</Box>
			)}
		</Box>
	);
};

export default CalendarEvent;
