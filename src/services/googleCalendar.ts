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
			new Error('chrome.identity unavailable — reload the extension in chrome://extensions')
		);
	}
	return chrome.identity.getAuthToken({ interactive }).then((result) => {
		if (!result.token) {
			throw new Error('Failed to get auth token');
		}
		return result.token;
	});
}

export async function fetchNextEvent(): Promise<CalendarEventItem | null> {
	const token = await getAuthToken(false);
	const timeMin = new Date().toISOString();
	const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=1&singleEvents=true&orderBy=startTime`;

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

export async function disconnectCalendar(): Promise<void> {
	try {
		const token = await getAuthToken(false);
		await chrome.identity.removeCachedAuthToken({ token });
	} catch {
		// Token may already be missing — that's fine
	}
	await chrome.storage.sync.remove('calendarConnected');
}
