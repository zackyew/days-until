import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { TYPOGRAPHY } from '../themes';
import { formatTimeUntil } from '../utils/time';

const ContentBox = styled(Box)({
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	flexDirection: 'column',
	gap: 16,
	textAlign: 'center',
	wordBreak: 'break-word',
});

const TitleText = styled(Typography)(TYPOGRAPHY.displayTitle);

const SubtitleText = styled(Typography)(TYPOGRAPHY.displaySubtitle);

const ClearButton = styled(Button)({
	marginTop: 16,
});

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
		<ContentBox>
			{isCelebration ? (
				<>
					<SubtitleText variant='h2'>Today's the day!</SubtitleText>
					<TitleText variant='h1'>{eventName}</TitleText>
				</>
			) : (
				<>
					<TitleText variant='h1'>{eventName}</TitleText>
					<SubtitleText variant='h2'>{timeLeft}</SubtitleText>
				</>
			)}
			<ClearButton variant='outlined' onClick={handleClear}>Clear</ClearButton>
		</ContentBox>
	);
};

export default DaysUntil;
