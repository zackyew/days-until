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
