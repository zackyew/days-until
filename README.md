# Days Until

A Chrome extension that replaces your new tab page with a personal countdown timer. Set any event you're looking forward to and watch the time melt away — down to the minute.

## Features

- Countdown timer to any custom event (days, hours, minutes)
- Countdown to your next Google Calendar event
- Live clock with today's date
- Celebration state with confetti when your event arrives
- Six gradient themes: Midnight, Ocean, Forest, Ember, Sunset, Aurora
- Glassmorphism card UI

## Development

```bash
# Production build (outputs to dist/)
npm run build

# Watch mode
npm run watch

# Run tests
npm test
```

## Loading as an unpacked extension

1. Run `npm run build`
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the `/dist` folder
5. Open a new tab — the extension will appear automatically

## Google Calendar integration

Connect your Google Calendar to count down to your next upcoming event. The extension uses read-only access and does not store or transmit any calendar data. See [privacy-policy.md](privacy-policy.md) for details.
