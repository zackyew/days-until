# Privacy Policy for Days Until

*Last updated: April 7, 2026*

---

## Overview

Days Until is a Chrome extension that replaces your new tab page with a personal countdown timer and optional Google Calendar integration. This policy explains what data the extension accesses and how it is handled.

---

## Data We Access

**Countdown timer data**
Your event name, target date, and theme preference are stored locally in your browser using `localStorage` and `chrome.storage.sync`. This data never leaves your device and is not transmitted to any server.

**Google Calendar data**
If you choose to connect Google Calendar, the extension requests read-only access to your calendar (`calendar.readonly`) to display your next upcoming event on the new tab page. Calendar data is fetched directly from the Google Calendar API and displayed in your browser. It is not stored, logged, or transmitted to any third party.

---

## Data We Do Not Collect

- We do not collect personal information
- We do not transmit any data to external servers operated by us
- We do not use analytics or tracking
- We do not share data with third parties

---

## Google OAuth

Authentication with Google is handled entirely by Chrome's built-in identity API. When you disconnect Google Calendar, the extension revokes your access token with Google's servers and removes it from Chrome's cache.

---

## Contact

If you have questions about this privacy policy, please open an issue at the extension's GitHub repository.
