# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Days Until** is a Chrome extension (Manifest V3) that replaces the new tab page with a countdown timer to a user-defined event. It also shows the next upcoming Google Calendar event.

## Commands

```bash
# Development build (watch mode)
npm run watch

# Production build (outputs to dist/)
npm run build

# Run tests
npm test

# Run a single test file
npm test -- --testPathPattern=App.test
```

> `npm start` (react-scripts dev server) is NOT how you develop this — it's a Chrome extension. Load `dist/` as an unpacked extension in `chrome://extensions` with Developer Mode enabled.

## Architecture

This is a **React + TypeScript** app bundled by **Webpack** (not CRA's dev server). The webpack config outputs to `dist/js/`, and `manifest.json` is copied to `dist/` by `CopyPlugin`. Chrome loads `dist/js/index.html` as the new tab override.

### State & communication

- **`localStorage`** stores `target-date`, `event-name`, and `theme`.
- **`chrome.storage.sync`** stores `calendarConnected` (whether the user has authorized Google Calendar).
- Components communicate state changes via a custom DOM event: `window.dispatchEvent(new Event('days-until'))`. `App.tsx` listens for this event to re-read localStorage and re-render.

### Component flow

```
App.tsx
├── ThemeSelector       — top-right swatch picker; writes theme to localStorage
├── InputFields         — shown when no target-date in localStorage
├── DaysUntil           — shown when target-date exists; polls every 10s
└── CalendarEvent       — always shown below divider; polls every 60s
```

### Google Calendar integration

`src/services/googleCalendar.ts` uses `chrome.identity.getAuthToken` (OAuth2 via the manifest's `oauth2` config) to get a bearer token, then calls the Google Calendar REST API directly. No SDK is used.

### Themes

Defined in `src/themes.ts` as `THEMES`. Each theme has a `gradient`, `label`, and `swatch`. The active theme applies a CSS class `background_<themeName>` to the root `Box` in `App.tsx`. Add new themes to `THEMES` and add the corresponding CSS class in `App.css`.
