import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

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
		<Box display='flex' flexDirection='column' alignItems='center' gap={0.5}>
			<Typography
				variant='h3'
				fontWeight={300}
				sx={{ opacity: 0.7, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em', fontSize: 'clamp(1.5rem, calc(-1.28rem + 2.94vw), 2.25rem)' }}
			>
				{time}
			</Typography>
			<Typography variant='body1' sx={{ opacity: 0.5 }}>
				{date}
			</Typography>
		</Box>
	);
};

export default Clock;
