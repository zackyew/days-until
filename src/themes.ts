export const THEMES = {
	midnight: {
		gradient: 'linear-gradient(135deg, #060d10, #0d1e24, #142534)',
		label: 'Midnight',
		swatch: '#203a43',
		mode: 'dark' as const,
		cardBg: 'rgba(255,255,255,0.08)',
	},
	ocean: {
		gradient: 'linear-gradient(135deg, #0a1628, #1a6b7a, #0d3b56)',
		label: 'Ocean',
		swatch: '#1a6b7a',
		mode: 'dark' as const,
		cardBg: 'rgba(255,255,255,0.09)',
	},
	forest: {
		gradient: 'linear-gradient(135deg, #0d2416, #2d6a4f, #162b1e)',
		label: 'Forest',
		swatch: '#2d6a4f',
		mode: 'dark' as const,
		cardBg: 'rgba(255,255,255,0.09)',
	},
	ember: {
		gradient: 'linear-gradient(135deg, #1a0000, #8b2500, #4a1505)',
		label: 'Ember',
		swatch: '#8b2500',
		mode: 'dark' as const,
		cardBg: 'rgba(255,255,255,0.09)',
	},
} as const;

export type ThemeName = keyof typeof THEMES;

export const TYPOGRAPHY = {
	displayTitle: {
		fontWeight: 400,
		opacity: 0.85,
		letterSpacing: '0.01em',
		fontSize: 'clamp(3rem, calc(-2.56rem + 5.88vw), 4.5rem)',
	},
	displaySubtitle: {
		fontWeight: 400,
		opacity: 0.85,
		fontVariantNumeric: 'tabular-nums',
		fontSize: 'clamp(2rem, calc(-1.71rem + 3.92vw), 3rem)',
	},
	clock: {
		fontWeight: 300,
		opacity: 0.7,
		fontVariantNumeric: 'tabular-nums',
		letterSpacing: '0.02em',
		fontSize: 'clamp(1.5rem, calc(-1.28rem + 2.94vw), 2.25rem)',
	},
	inputHeading: {
		fontSize: '1.5rem',
	},
};
