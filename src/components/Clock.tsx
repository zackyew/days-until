import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { TYPOGRAPHY } from '../themes';

const ClockBox = styled(Box)({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: 4,
});

const TimeText = styled(Typography)(TYPOGRAPHY.clock);

const DateText = styled(Typography)({
	opacity: 0.5,
});

const Clock = () => {
	const [time, setTime] = useState(() => dayjs().format('h:mm A'));
	const date = dayjs().format('dddd, MMMM D');

	useEffect(() => {
		const interval = setInterval(() => {
			setTime(dayjs().format('h:mm A'));
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<ClockBox>
			<TimeText variant='h3'>{time}</TimeText>
			<DateText variant='body1'>{date}</DateText>
		</ClockBox>
	);
};

export default Clock;
