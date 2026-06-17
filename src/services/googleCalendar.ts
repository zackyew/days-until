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

const TOKEN_KEY = 'oauthToken';
const TOKEN_EXPIRY_KEY = 'oauthTokenExpiry';

function getStoredToken(): Promise<{ token: string; expiresAt: number } | null> {
	return new Promise((resolve) => {
		chrome.storage.local.get([TOKEN_KEY, TOKEN_EXPIRY_KEY], (result) => {
			const token = result[TOKEN_KEY] as string | undefined;
			const expiresAt = result[TOKEN_EXPIRY_KEY] as number | undefined;
			resolve(token && expiresAt ? { token, expiresAt } : null);
		});
	});
}

function storeToken(token: string, expiresInSeconds: number): Promise<void> {
	const expiresAt = Date.now() + expiresInSeconds * 1000;
	return chrome.storage.local.set({ [TOKEN_KEY]: token, [TOKEN_EXPIRY_KEY]: expiresAt });
}

export function getAuthToken(interactive: boolean): Promise<string> {
	if (!chrome.identity) {
		return Promise.reject(
			new Error(
				'chrome.identity unavailable — reload the extension in chrome://extensions',
			),
		);
	}

	return getStoredToken().then((stored) => {
		// Return cached token if valid with a 60s buffer
		if (stored && stored.expiresAt - Date.now() > 60_000) {
			return stored.token;
		}

		const manifest = chrome.runtime.getManifest() as chrome.runtime.Manifest & {
			oauth2?: { client_id: string; scopes: string[] };
		};
		const clientId = manifest.oauth2?.client_id ?? '';
		const scope = (manifest.oauth2?.scopes ?? []).join(' ');
		const redirectUri = chrome.identity.getRedirectURL();

		const buildAuthUrl = (prompt: string) =>
			'https://accounts.google.com/o/oauth2/v2/auth' +
			`?client_id=${encodeURIComponent(clientId)}` +
			`&response_type=token` +
			`&redirect_uri=${encodeURIComponent(redirectUri)}` +
			`&scope=${encodeURIComponent(scope)}` +
			`&prompt=${prompt}`;

		const launchFlow = (inter: boolean) =>
			new Promise<string>((resolve, reject) => {
				chrome.identity.launchWebAuthFlow(
					{ url: buildAuthUrl(inter ? 'select_account' : 'none'), interactive: inter },
					(responseUrl) => {
						if (chrome.runtime.lastError) {
							reject(new Error(chrome.runtime.lastError.message));
							return;
						}
						if (!responseUrl) {
							reject(new Error('OAuth flow returned no URL'));
							return;
						}
						const hash = new URL(responseUrl).hash.slice(1);
						const params = new URLSearchParams(hash);
						const token = params.get('access_token');
						const expiresIn = parseInt(params.get('expires_in') ?? '3600', 10);
						if (!token) {
							reject(new Error('No access token in OAuth response'));
							return;
						}
						storeToken(token, expiresIn).then(() => resolve(token)).catch(reject);
					},
				);
			});

		// Try silent refresh first; fall back to interactive only if explicitly requested
		return launchFlow(false).catch(() => {
			if (!interactive) {
				throw new Error('OAuth token expired — please reconnect Google Calendar');
			}
			return launchFlow(true);
		});
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

const CACHED_CALENDAR_LIST_KEY = 'cachedCalendarList';

export async function getCachedCalendarList(): Promise<CalendarListItem[]> {
	return new Promise((resolve) => {
		chrome.storage.local.get(CACHED_CALENDAR_LIST_KEY, (result) => {
			resolve((result[CACHED_CALENDAR_LIST_KEY] as CalendarListItem[]) ?? []);
		});
	});
}

export async function setCachedCalendarList(list: CalendarListItem[]): Promise<void> {
	await chrome.storage.local.set({ [CACHED_CALENDAR_LIST_KEY]: list });
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
		const stored = await getStoredToken();
		if (stored) {
			await fetch(`https://oauth2.googleapis.com/revoke?token=${stored.token}`, {
				method: 'POST',
			});
		}
	} catch {
		// Token may already be missing or revocation may fail — that's fine
	}
	await chrome.storage.sync.remove([
		'calendarConnected',
		SELECTED_CALENDAR_KEY,
		HIDDEN_CALENDARS_KEY,
	]);
	await chrome.storage.local.remove([
		TOKEN_KEY,
		TOKEN_EXPIRY_KEY,
		CACHED_EVENT_KEY,
		CACHED_CALENDAR_LIST_KEY,
	]);
}
