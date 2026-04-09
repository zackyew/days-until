import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { TYPOGRAPHY } from '../themes';

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
			<Typography variant='h3' sx={TYPOGRAPHY.clock}>
				{time}
			</Typography>
			<Typography variant='body1' sx={{ opacity: 0.5 }}>
				{date}
			</Typography>
		</Box>
	);
};

export default Clock;
