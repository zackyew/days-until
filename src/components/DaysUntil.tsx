import { Box, Button, Typography } from '@mui/material';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { formatTimeUntil } from '../utils/time';

const DaysUntil = () => {
	const [eventName, setEventName] = useState<string | null>('');
	const [targetDate, setTargetDate] = useState<string | null>();
	const [timeLeft, setTimeLeft] = useState('');
	const [isCelebration, setIsCelebration] = useState(false);

	useEffect(() => {
		setEventName(window.localStorage.getItem('event-name'));
		setTargetDate(window.localStorage.getItem('target-date'));
	}, []);

	const calculateTimeLeft = useCallback(() => {
		const msLeft = dayjs(targetDate).diff(dayjs());
		const isToday = dayjs(targetDate).isSame(dayjs(), 'day');
		setIsCelebration(isToday && msLeft <= 60 * 60 * 1000);

		if (msLeft < 0 && !isToday) return 'This event has passed';
		if (isToday && msLeft <= 0) return '';

		return formatTimeUntil(targetDate!);
	}, [targetDate]);

	useEffect(() => {
		setTimeLeft(calculateTimeLeft());
		const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 10000);
		return () => clearInterval(interval);
	}, [calculateTimeLeft]);

	useEffect(() => {
		if (!isCelebration || !targetDate) return;
		const firedFor = window.localStorage.getItem('confetti-fired-for');
		if (firedFor === targetDate) return;
		window.localStorage.setItem('confetti-fired-for', targetDate);
		confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
	}, [isCelebration, targetDate]);

	const handleClear = useCallback(() => {
		window.localStorage.removeItem('event-name');
		window.localStorage.removeItem('target-date');
		window.localStorage.removeItem('confetti-fired-for');
		window.dispatchEvent(new Event('days-until'));
	}, []);

	return (
		<Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' gap={2} sx={{ textAlign: 'center', wordBreak: 'break-word' }}>
			{isCelebration ? (
				<>
					<Typography variant='h2' fontWeight={400} sx={{ opacity: 0.85, fontSize: 'clamp(2rem, calc(-1.71rem + 3.92vw), 3rem)' }}>
						Today's the day!
					</Typography>
					<Typography variant='h1' fontWeight={400} sx={{ opacity: 0.85, letterSpacing: '0.01em', fontSize: 'clamp(3rem, calc(-2.56rem + 5.88vw), 4.5rem)' }}>
						{eventName}
					</Typography>
				</>
			) : (
				<>
					<Typography variant='h1' fontWeight={400} sx={{ opacity: 0.85, letterSpacing: '0.01em', fontSize: 'clamp(3rem, calc(-2.56rem + 5.88vw), 4.5rem)' }}>
						{eventName}
					</Typography>
					<Typography variant='h2' fontWeight={400} sx={{ opacity: 0.85, fontVariantNumeric: 'tabular-nums', fontSize: 'clamp(2rem, calc(-1.71rem + 3.92vw), 3rem)' }}>
						{timeLeft}
					</Typography>
				</>
			)}
			<Button variant='outlined' onClick={handleClear} sx={{ marginTop: 2 }}>
				Clear
			</Button>
		</Box>
	);
};

export default DaysUntil;
