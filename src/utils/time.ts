import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

export function formatTimeUntil(isoDate: string): string {
	const diff = dayjs(isoDate).diff(dayjs());
	if (diff < 0) return 'now';

	const dur = dayjs.duration(diff);
	const days = dur.days();
	const hours = dur.hours();
	const minutes = dur.minutes();

	let result = 'in ';
	if (days > 0) result += `${days} day${days === 1 ? '' : 's'} and `;
	if (hours > 0) {
		result += `${hours} hour${hours === 1 ? '' : 's'}`;
		if (days === 0 && minutes > 0) result += ' and ';
	}
	if (minutes > 0) {
		if (hours === 0 || days === 0)
			result += `${minutes} minute${minutes === 1 ? '' : 's'}`;
	} else if (hours === 0 && days === 0) {
		result += '0 minutes';
	}
	return result;
}
