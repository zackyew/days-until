import dayjs from 'dayjs';

export function formatTimeUntil(isoDate: string): string {
	const now = dayjs();
	const target = dayjs(isoDate);
	if (target.diff(now) < 0) return 'now';

	const years = target.diff(now, 'year');
	const afterYears = now.add(years, 'year');
	const months = target.diff(afterYears, 'month');
	const afterMonths = afterYears.add(months, 'month');
	const days = target.diff(afterMonths, 'day');
	const afterDays = afterMonths.add(days, 'day');
	const hours = target.diff(afterDays, 'hour');
	const afterHours = afterDays.add(hours, 'hour');
	const minutes = target.diff(afterHours, 'minute');

	const parts: string[] = [];
	if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`);
	if (months > 0) parts.push(`${months} month${months === 1 ? '' : 's'}`);
	if (days > 0 && years === 0) parts.push(`${days} day${days === 1 ? '' : 's'}`);
	if (hours > 0 && years === 0 && months === 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
	if (minutes > 0 && years === 0 && months === 0 && days === 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
	if (parts.length === 0) parts.push('0 minutes');

	const joined =
		parts.length === 1
			? parts[0]
			: `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;

	return `in ${joined}`;
}
