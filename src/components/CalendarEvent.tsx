import React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
	Box,
	Button,
	CircularProgress,
	IconButton,
	Link,
	Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import {
	CalendarEventItem,
	disconnectCalendar,
	fetchNextEvent,
	getAuthToken,
	getCachedEvent,
	setCachedEvent,
} from '../services/googleCalendar';
import { TYPOGRAPHY } from '../themes';
import { formatTimeUntil } from '../utils/time';

type Status = 'disconnected' | 'loading' | 'connected' | 'error';

const REFRESH_INTERVAL_MS = 60_000;

interface FullscreenProp {
	isFullscreen: boolean;
}
const forwardAll = {
	shouldForwardProp: (prop: string) => prop !== 'isFullscreen',
};

const EventBox = styled(
	Box,
	forwardAll,
)<FullscreenProp>(({ isFullscreen }) => ({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: isFullscreen ? 16 : 4,
	opacity: isFullscreen ? 1 : 0.75,
}));

const EventTitleRow = styled(Box)({
	display: 'flex',
	alignItems: 'center',
	gap: 4,
});

const EventTitle = styled(
	Typography,
	forwardAll,
)<FullscreenProp>(({ isFullscreen }) =>
	isFullscreen ? TYPOGRAPHY.displayTitle : { fontWeight: 500 },
);

interface CallIconButtonProps extends FullscreenProp {
	component?: React.ElementType;
	href?: string;
	target?: string;
	rel?: string;
}

const CallIconButton = styled(IconButton, {
	shouldForwardProp: (prop) => prop !== 'isFullscreen',
})<CallIconButtonProps>(({ isFullscreen }) => ({
	padding: isFullscreen ? '6px' : '4px',
}));

const CallIcon = styled(
	OpenInNewIcon,
	forwardAll,
)<FullscreenProp>(({ isFullscreen }) => ({
	fontSize: isFullscreen ? '2rem' : '1.1rem',
}));

const FullscreenSubtitle = styled(Typography)(TYPOGRAPHY.displaySubtitle);

const EventDateTime = styled(
	Typography,
	forwardAll,
)<FullscreenProp>(({ isFullscreen }) => ({
	opacity: isFullscreen ? 0.55 : 1,
	fontWeight: 400,
}));

const EventLocation = styled(Typography)({
	opacity: 0.75,
	textAlign: 'center',
});

const ConnectButton = styled(Button)({ opacity: 0.8 });

const FullscreenClearButton = styled(Button)({ marginTop: 16 });

const DisconnectLink = styled(Link)({
	marginTop: 4,
	cursor: 'pointer',
	opacity: 0.75,
}) as typeof Link;

const RetryLink = styled(Link)({ cursor: 'pointer' }) as typeof Link;

const NonFullscreenTime = styled(Typography)({ opacity: 0.75 });

const ErrorDetail = styled(Typography)({ opacity: 0.6 });

const ErrorContainer = styled(Box)({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: 4,
});

const ErrorRow = styled(Box)({
	display: 'flex',
	alignItems: 'center',
	gap: 8,
});

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

function formatEventDateTime(
	start: CalendarEventItem['start'],
	end: CalendarEventItem['end'],
): string {
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
			await setCachedEvent(next);
		} catch (err) {
			console.error('[CalendarEvent] loadEvent failed:', err);
			setErrorDetail(toGenericError(err));
			setStatus('error');
		}
	}, []);

	useEffect(() => {
		chrome.storage.sync.get('calendarConnected', async (result) => {
			if (!result.calendarConnected) {
				setStatus('disconnected');
				return;
			}
			const cached = await getCachedEvent();
			if (cached) {
				setEvent(cached);
				setNoEvents(false);
				setStatus('connected');
			}
			loadEvent();
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
	const callUrl =
		event?.hangoutLink ??
		(event?.location && isUrl(event.location) ? event.location : null);

	return (
		<EventBox isFullscreen={isFullscreen}>
			{status === 'loading' && <CircularProgress size={16} />}

			{status === 'disconnected' && (
				<ConnectButton variant='text' size='small' onClick={handleConnect}>
					Connect Google Calendar
				</ConnectButton>
			)}

			{status === 'connected' && noEvents && (
				<Typography variant='body1'>No upcoming events</Typography>
			)}

			{status === 'connected' && event && eventStart && (
				<>
					<EventTitleRow>
						<EventTitle
							variant={isFullscreen ? 'h1' : 'h5'}
							isFullscreen={isFullscreen}
						>
							{event.summary}
						</EventTitle>
						{callUrl && (
							<CallIconButton
								component='a'
								href={callUrl}
								target='_blank'
								rel='noopener noreferrer'
								isFullscreen={isFullscreen}
							>
								<CallIcon isFullscreen={isFullscreen} />
							</CallIconButton>
						)}
					</EventTitleRow>

					{isFullscreen ? (
						<FullscreenSubtitle variant='h2'>
							{formatTimeUntil(eventStart)}
						</FullscreenSubtitle>
					) : (
						<NonFullscreenTime variant='body1'>
							{formatTimeUntil(eventStart)}
						</NonFullscreenTime>
					)}

					<EventDateTime
						variant={isFullscreen ? 'body1' : 'h6'}
						isFullscreen={isFullscreen}
					>
						{formatEventDateTime(event.start, event.end)}
					</EventDateTime>

					{event.location && !isUrl(event.location) && (
						<EventLocation variant='body1'>{event.location}</EventLocation>
					)}

					{isFullscreen ? (
						<FullscreenClearButton variant='outlined' onClick={onClear}>
							Clear
						</FullscreenClearButton>
					) : (
						<DisconnectLink
							component='button'
							variant='body2'
							onClick={handleDisconnect}
						>
							Disconnect calendar
						</DisconnectLink>
					)}
				</>
			)}

			{status === 'error' && (
				<ErrorContainer>
					<ErrorRow>
						<Typography variant='body1'>Could not load calendar</Typography>
						<RetryLink component='button' variant='body2' onClick={loadEvent}>
							Retry
						</RetryLink>
					</ErrorRow>
					{errorDetail && (
						<ErrorDetail variant='body2'>{errorDetail}</ErrorDetail>
					)}
				</ErrorContainer>
			)}
		</EventBox>
	);
};

export default CalendarEvent;
