import dayjs from 'dayjs';
import { formatTimeUntil } from './time';

// Helper: return an ISO string that is `amount` of `unit` from now
function fromNow(amount: number, unit: dayjs.ManipulateType, extra = 0): string {
	return dayjs().add(amount, unit).add(extra, 'minute').toISOString();
}

describe('formatTimeUntil', () => {
	it('returns "now" for a past date', () => {
		const past = dayjs().subtract(1, 'day').toISOString();
		expect(formatTimeUntil(past)).toBe('now');
	});

	it('returns "in 0 minutes" when less than a minute remains', () => {
		const soon = dayjs().add(30, 'second').toISOString();
		expect(formatTimeUntil(soon)).toBe('in 0 minutes');
	});

	it('handles minutes only', () => {
		const target = dayjs().add(45, 'minute').toISOString();
		expect(formatTimeUntil(target)).toBe('in 45 minutes');
	});

	it('handles 1 minute (singular)', () => {
		const target = dayjs().add(1, 'minute').add(10, 'second').toISOString();
		expect(formatTimeUntil(target)).toBe('in 1 minute');
	});

	it('handles hours and minutes', () => {
		const target = dayjs().add(5, 'hour').add(30, 'minute').toISOString();
		expect(formatTimeUntil(target)).toBe('in 5 hours and 30 minutes');
	});

	it('handles hours with no minutes', () => {
		const target = dayjs().add(3, 'hour').add(30, 'second').toISOString();
		expect(formatTimeUntil(target)).toBe('in 3 hours');
	});

	it('handles days and hours', () => {
		const target = dayjs().add(10, 'day').add(3, 'hour').toISOString();
		expect(formatTimeUntil(target)).toBe('in 10 days and 3 hours');
	});

	it('handles 1 day (singular)', () => {
		const target = dayjs().add(1, 'day').add(1, 'hour').toISOString();
		expect(formatTimeUntil(target)).toBe('in 1 day and 1 hour');
	});

	it('handles days with no hours', () => {
		const target = dayjs().add(5, 'day').add(30, 'second').toISOString();
		expect(formatTimeUntil(target)).toBe('in 5 days');
	});

	it('handles months and days', () => {
		const target = dayjs().add(2, 'month').add(5, 'day').toISOString();
		expect(formatTimeUntil(target)).toBe('in 2 months and 5 days');
	});

	it('handles 1 month (singular)', () => {
		const target = dayjs().add(1, 'month').add(2, 'day').toISOString();
		expect(formatTimeUntil(target)).toBe('in 1 month and 2 days');
	});

	it('handles months with no remaining days', () => {
		const target = dayjs().add(3, 'month').add(1, 'hour').toISOString();
		expect(formatTimeUntil(target)).toBe('in 3 months');
	});

	it('does not show hours when months are present', () => {
		const target = dayjs().add(2, 'month').add(5, 'hour').toISOString();
		expect(formatTimeUntil(target)).toBe('in 2 months');
	});

	it('handles years and months', () => {
		const target = dayjs().add(2, 'year').add(3, 'month').toISOString();
		expect(formatTimeUntil(target)).toBe('in 2 years and 3 months');
	});

	it('handles 1 year (singular)', () => {
		const target = dayjs().add(1, 'year').add(6, 'month').toISOString();
		expect(formatTimeUntil(target)).toBe('in 1 year and 6 months');
	});

	it('handles years with no remaining months', () => {
		const target = dayjs().add(3, 'year').add(5, 'day').toISOString();
		expect(formatTimeUntil(target)).toBe('in 3 years');
	});

	it('does not show days when years are present', () => {
		const target = dayjs().add(2, 'year').add(15, 'day').toISOString();
		expect(formatTimeUntil(target)).toBe('in 2 years');
	});
});
