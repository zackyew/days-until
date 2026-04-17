import React, { useMemo, useState } from 'react';
import TextField from '@mui/material/TextField';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import { TYPOGRAPHY } from '../themes';
import {
	DateTimePicker,
	DateTimeValidationError,
	LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const InputBox = styled(Box)({
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	flexDirection: 'column',
	gap: 32,
});

const TimerIcon = styled(AvTimerIcon)({
	fontSize: 75,
});

const HeadingText = styled(Typography)(TYPOGRAPHY.inputHeading);

interface Props {
	onCountdownToCalendar?: () => void;
}

function InputFields({ onCountdownToCalendar }: Props) {
	const [name, setName] = useState('');
	const [date, setDate] = useState<Dayjs | null>(dayjs().add(1, 'd').minute(0).second(0));
	const [error, setError] = useState<DateTimeValidationError | null>(null);

	const saveDate = () => {
		chrome.storage.sync.set({
			'event-name': name.trim(),
			'target-date': date?.toString() ?? '',
		});
	};

	const errorMessage = useMemo(() => {
		switch (error) {
			case 'invalidDate':
				return 'Please enter a valid date';
			default:
				return '';
		}
	}, [error]);

	return (
		<InputBox>
			<TimerIcon />
			<HeadingText variant='h4'>What are you looking forward to next?</HeadingText>
			<TextField
				placeholder='Name'
				autoComplete='off'
				value={name}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					setName(event.target.value);
				}}
			/>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<DateTimePicker
					value={date}
					onChange={(newValue) => {
						if (newValue !== null) {
							newValue = newValue.second(0);
						}
						setDate(newValue);
					}}
					disablePast
					onError={(newError) => setError(newError)}
					slotProps={{
						textField: {
							helperText: errorMessage,
						},
					}}
				/>
			</LocalizationProvider>
			<Button
				variant='outlined'
				disabled={error !== null || date === null || name.trim() === ''}
				onClick={saveDate}
			>
				Save
			</Button>
			{onCountdownToCalendar && (
				<Button variant='outlined' onClick={onCountdownToCalendar}>
					Countdown to next calendar event
				</Button>
			)}
		</InputBox>
	);
}

export default InputFields;
