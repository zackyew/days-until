export interface CalendarEventItem {
	summary: string;
	start: {
		dateTime?: string;
		date?: string;
	};
	end: {
		dateTime?: string;
		date?: string;
	};
	location?: string;
	hangoutLink?: string;
}

export function getAuthToken(interactive: boolean): Promise<string> {
	if (!chrome.identity) {
		return Promise.reject(
			new Error(
				'chrome.identity unavailable — reload the extension in chrome://extensions',
			),
		);
	}
	return chrome.identity.getAuthToken({ interactive }).then((result) => {
		if (!result.token) {
			throw new Error('Failed to get auth token');
		}
		return result.token;
	});
}

export interface CalendarListItem {
	id: string;
	summary: string;
	summaryOverride?: string;
	primary?: boolean;
}

export async function fetchCalendarList(): Promise<CalendarListItem[]> {
	const token = await getAuthToken(false);
	const url =
		'https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader';
	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) {
		throw new Error(`Calendar list API error: ${response.status}`);
	}
	const data = await response.json();
	return (data.items ?? [])
		.map(
			(item: {
				id: string;
				summary: string;
				primary?: boolean;
				summaryOverride?: string;
			}) => ({
				id: item.id,
				summary: item.summary,
				primary: item.primary,
				summaryOverride: item.summaryOverride,
			}),
		)
		.sort((a: CalendarListItem, b: CalendarListItem) =>
			(a.summaryOverride ?? a.summary).localeCompare(b.summaryOverride ?? b.summary),
		);
}

export async function fetchNextEvent(
	calendarId = 'primary',
): Promise<CalendarEventItem | null> {
	const token = await getAuthToken(false);
	const timeMin = new Date().toISOString();
	const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=1&singleEvents=true&orderBy=startTime`;

	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		throw new Error(`Calendar API error: ${response.status}`);
	}

	const data = await response.json();
	const items: CalendarEventItem[] = data.items ?? [];
	return items[0] ?? null;
}

const SELECTED_CALENDAR_KEY = 'selectedCalendarId';

export async function getSelectedCalendarId(): Promise<string> {
	return new Promise((resolve) => {
		chrome.storage.sync.get(SELECTED_CALENDAR_KEY, (result) => {
			resolve((result[SELECTED_CALENDAR_KEY] as string) ?? 'primary');
		});
	});
}

export async function setSelectedCalendarId(id: string): Promise<void> {
	await chrome.storage.sync.set({ [SELECTED_CALENDAR_KEY]: id });
}

const HIDDEN_CALENDARS_KEY = 'hiddenCalendarIds';

export async function getHiddenCalendarIds(): Promise<string[]> {
	return new Promise((resolve) => {
		chrome.storage.sync.get(HIDDEN_CALENDARS_KEY, (result) => {
			resolve((result[HIDDEN_CALENDARS_KEY] as string[]) ?? []);
		});
	});
}

export async function setHiddenCalendarIds(ids: string[]): Promise<void> {
	await chrome.storage.sync.set({ [HIDDEN_CALENDARS_KEY]: ids });
}

const CACHED_EVENT_KEY = 'cachedCalendarEvent';

export async function getCachedEvent(): Promise<CalendarEventItem | null> {
	return new Promise((resolve) => {
		chrome.storage.local.get(CACHED_EVENT_KEY, (result) => {
			resolve((result[CACHED_EVENT_KEY] as CalendarEventItem) ?? null);
		});
	});
}

export async function setCachedEvent(
	event: CalendarEventItem | null,
): Promise<void> {
	if (event === null) {
		await chrome.storage.local.remove(CACHED_EVENT_KEY);
	} else {
		await chrome.storage.local.set({ [CACHED_EVENT_KEY]: event });
	}
}

export async function disconnectCalendar(): Promise<void> {
	try {
		const token = await getAuthToken(false);
		await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
			method: 'POST',
		});
		await chrome.identity.removeCachedAuthToken({ token });
	} catch {
		// Token may already be missing or revocation may fail — that's fine
	}
	await chrome.storage.sync.remove([
		'calendarConnected',
		SELECTED_CALENDAR_KEY,
		HIDDEN_CALENDARS_KEY,
	]);
	await chrome.storage.local.remove(CACHED_EVENT_KEY);
}
