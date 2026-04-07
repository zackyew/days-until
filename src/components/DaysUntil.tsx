import { Box, Button, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

const DaysUntil = () => {
	const [eventName, setEventName] = useState<string | null>('');
	const [targetDate, setTargetDate] = useState<string | null>();
	const [timeLeft, setTimeLeft] = useState('');

	useEffect(() => {
		setEventName(window.localStorage.getItem('event-name'));
		setTargetDate(window.localStorage.getItem('target-date'));
	}, []);

	const calculateTimeLeft = useCallback(() => {
		const days = dayjs(targetDate).diff(dayjs(), 'days');
		let hours = dayjs(targetDate).diff(dayjs(), 'hours');
		hours = hours - days * 24;
		let minutes = dayjs(targetDate).diff(dayjs(), 'minutes', true);
		minutes =
			hours === 0
				? Math.floor(minutes - days * 24 * 60)
				: Math.floor(minutes - hours * 60);

		// Event is in the past
		if (dayjs(targetDate).diff(dayjs()) < 0) {
			return 'This event has passed';
		}

		let timeString = 'in ';
		if (days > 0) {
			timeString += `${days} day${days === 1 ? '' : 's'} and `;
		}

		if (hours > 0) {
			timeString += `${hours} hour${hours === 1 ? '' : 's'}`;
			if (days === 0 && minutes > 0) {
				timeString += ' and ';
			}
		}

		if (minutes > 0) {
			if (hours === 0) {
				timeString += `${minutes} minute${minutes === 1 ? '' : 's'}`;
			} else if (days === 0)
				timeString += `${minutes} minute${minutes === 1 ? '' : 's'}`;
		} else {
			timeString += `0 minutes`;
		}

		return timeString;
	}, [targetDate]);

	useEffect(() => {
		setTimeLeft(calculateTimeLeft());

		const interval = setInterval(() => {
			setTimeLeft(calculateTimeLeft());
		}, 10000);

		return () => clearInterval(interval);
	}, [calculateTimeLeft]);

	const handleClear = useCallback(() => {
		window.localStorage.removeItem('event-name');
		window.localStorage.removeItem('target-date');
		window.dispatchEvent(new Event('days-until'));
	}, []);

	return (
		<Box
			display='flex'
			justifyContent='center'
			alignItems='center'
			flexDirection='column'
			gap={2}
		>
			<Typography
				variant='h1'
				fontWeight={400}
				sx={{
					opacity: 0.85,
					letterSpacing: '0.01em',
				}}
			>
				{eventName}
			</Typography>
			<Typography
				variant='h2'
				fontWeight={400}
				sx={{ opacity: 0.85, fontVariantNumeric: 'tabular-nums' }}
			>
				{timeLeft}
			</Typography>
			<Button variant='outlined' onClick={handleClear} sx={{ marginTop: 4 }}>
				Clear
			</Button>
		</Box>
	);
};

export default DaysUntil;
