import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import dayjs from 'dayjs';
import {
	CalendarEventItem,
	disconnectCalendar,
	fetchNextEvent,
	getAuthToken,
} from '../services/googleCalendar';

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

function formatEventDateTime(start: CalendarEventItem['start']): string {
	if (start.dateTime) {
		return dayjs(start.dateTime).format('ddd, MMM D · h:mm A');
	}
	if (start.date) {
		return dayjs(start.date).format('ddd, MMM D');
	}
	return '';
}

function formatTimeUntil(isoDate: string): string {
	const days = dayjs(isoDate).diff(dayjs(), 'days');
	let hours = dayjs(isoDate).diff(dayjs(), 'hours');
	hours = hours - days * 24;
	let minutes = dayjs(isoDate).diff(dayjs(), 'minutes', true);
	minutes =
		hours === 0
			? Math.floor(minutes - days * 24 * 60)
			: Math.floor(minutes - hours * 60);

	if (dayjs(isoDate).diff(dayjs()) < 0) return 'now';

	let result = 'in ';
	if (days > 0) result += `${days} day${days === 1 ? '' : 's'} and `;
	if (hours > 0) {
		result += `${hours} hour${hours === 1 ? '' : 's'}`;
		if (days === 0 && minutes > 0) result += ' and ';
	}
	if (minutes > 0) {
		if (hours === 0 || days === 0)
			result += `${minutes} minute${minutes === 1 ? '' : 's'}`;
	} else if (hours === 0 && days === 0) {
		result += '0 minutes';
	}
	return result;
}

const CalendarEvent = () => {
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

	// Check initial connection state
	useEffect(() => {
		chrome.storage.sync.get('calendarConnected', (result) => {
			if (result.calendarConnected) {
				loadEvent();
			} else {
				setStatus('disconnected');
			}
		});
	}, [loadEvent]);

	// Refresh on interval
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

	return (
		<Box
			display='flex'
			flexDirection='column'
			alignItems='center'
			gap={0.5}
			sx={{ opacity: 0.75 }}
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
					<Typography variant='h5' fontWeight={500}>
						{event.summary}
					</Typography>
					<Typography variant='h6' fontWeight={400}>
						{formatEventDateTime(event.start)}
					</Typography>
					<Typography variant='body1' sx={{ opacity: 0.75 }}>
						{formatTimeUntil(eventStart)}
					</Typography>
					{event.location && !isUrl(event.location) && (
						<Typography variant='body1' sx={{ opacity: 0.75 }}>
							{event.location}
						</Typography>
					)}
					{(event.hangoutLink ?? (event.location && isUrl(event.location) ? event.location : null)) && (
						<Button
							variant='outlined'
							size='small'
							endIcon={<OpenInNewIcon fontSize='small' />}
							href={event.hangoutLink ?? event.location!}
							target='_blank'
							rel='noopener noreferrer'
							sx={{ mt: 0.5 }}
						>
							Join call
						</Button>
					)}
					<Link
						component='button'
						variant='body2'
						onClick={handleDisconnect}
						sx={{ mt: 0.5, cursor: 'pointer', opacity: 0.75 }}
					>
						Disconnect calendar
					</Link>
				</>
			)}

			{status === 'error' && (
				<Box display='flex' flexDirection='column' alignItems='center' gap={0.5}>
					<Box display='flex' alignItems='center' gap={1}>
						<Typography variant='body1'>Could not load calendar</Typography>
						<Link
							component='button'
							variant='body2'
							onClick={loadEvent}
							sx={{ cursor: 'pointer' }}
						>
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
