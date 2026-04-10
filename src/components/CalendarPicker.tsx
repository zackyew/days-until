import MenuIcon from '@mui/icons-material/Menu';
import {
	Box,
	Checkbox,
	FormControlLabel,
	IconButton,
	MenuItem,
	Popover,
	Select,
	SelectChangeEvent,
	Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
	CalendarListItem,
	fetchCalendarList,
	getCachedCalendarList,
	getHiddenCalendarIds,
	getSelectedCalendarId,
	setCachedCalendarList,
	setHiddenCalendarIds,
	setSelectedCalendarId,
} from '../services/googleCalendar';

interface Props {
	onReady: (calendarId: string) => void;
	onSelectionChange: (calendarId: string) => void;
}

function resolveId(savedId: string, list: CalendarListItem[]): string {
	return savedId === 'primary' ? (list.find((c) => c.primary)?.id ?? savedId) : savedId;
}

const CalendarPicker = ({ onReady, onSelectionChange }: Props) => {
	const [calendarList, setCalendarList] = useState<CalendarListItem[]>([]);
	const [selectedCalendarId, setSelectedCalendarIdState] = useState<string>('primary');
	const [hiddenCalendarIds, setHiddenCalendarIdsState] = useState<string[]>([]);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	useEffect(() => {
		(async () => {
			const [savedId, cachedList, hidden] = await Promise.all([
				getSelectedCalendarId(),
				getCachedCalendarList(),
				getHiddenCalendarIds(),
			]);
			setHiddenCalendarIdsState(hidden);
			if (cachedList.length > 0) {
				setCalendarList(cachedList);
				const resolved = resolveId(savedId, cachedList);
				setSelectedCalendarIdState(resolved);
				onReady(resolved);
			}
			try {
				const freshList = await fetchCalendarList();
				setCalendarList(freshList);
				await setCachedCalendarList(freshList);
				const resolved = resolveId(savedId, freshList);
				setSelectedCalendarIdState(resolved);
				if (cachedList.length === 0) {
					onReady(resolved);
				}
			} catch {
				if (cachedList.length === 0) {
					onReady(savedId);
				}
			}
		})();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const handleCalendarChange = useCallback(
		async (e: SelectChangeEvent<string>) => {
			const newId = e.target.value;
			setSelectedCalendarIdState(newId);
			await setSelectedCalendarId(newId);
			onSelectionChange(newId);
		},
		[onSelectionChange],
	);

	const handleToggleHidden = useCallback(
		async (calId: string, currentlyHidden: boolean) => {
			const next = currentlyHidden
				? hiddenCalendarIds.filter((id) => id !== calId)
				: [...hiddenCalendarIds, calId];
			setHiddenCalendarIdsState(next);
			await setHiddenCalendarIds(next);
			if (!currentlyHidden && calId === selectedCalendarId) {
				const firstVisible = calendarList.find(
					(c) => c.id !== calId && !next.includes(c.id),
				);
				if (firstVisible) {
					setSelectedCalendarIdState(firstVisible.id);
					await setSelectedCalendarId(firstVisible.id);
					onSelectionChange(firstVisible.id);
				}
			}
		},
		[hiddenCalendarIds, selectedCalendarId, calendarList, onSelectionChange],
	);

	if (calendarList.length <= 1) return null;

	const visibleCalendars = calendarList.filter((c) => !hiddenCalendarIds.includes(c.id));

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, marginBottom: '5px' }}>
			<Select
				value={selectedCalendarId}
				onChange={handleCalendarChange}
				variant='outlined'
				sx={{ fontSize: '0.75rem', opacity: 0.75 }}
				size='small'
			>
				{visibleCalendars.map((cal) => (
					<MenuItem key={cal.id} value={cal.id} sx={{ fontSize: '0.75rem' }}>
						{cal.summaryOverride ?? cal.summary}
					</MenuItem>
				))}
			</Select>
			<IconButton
				size='small'
				onClick={(e) => setAnchorEl(e.currentTarget)}
				sx={{ opacity: 0.6 }}
			>
				<MenuIcon fontSize='small' />
			</IconButton>
			<Popover
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
			>
				<Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column' }}>
					{calendarList.map((cal) => {
						const isHidden = hiddenCalendarIds.includes(cal.id);
						return (
							<FormControlLabel
								key={cal.id}
								label={
									<Typography variant='body2'>
										{cal.summaryOverride ?? cal.summary}
									</Typography>
								}
								control={
									<Checkbox
										checked={!isHidden}
										size='small'
										onChange={() => handleToggleHidden(cal.id, isHidden)}
									/>
								}
							/>
						);
					})}
				</Box>
			</Popover>
		</Box>
	);
};

export default CalendarPicker;
