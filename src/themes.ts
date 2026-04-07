export const THEMES = {
	mint: {
		gradient: 'linear-gradient(55deg, #adf2e0, #9fa0e8, #f3d088)',
		label: 'Mint',
		swatch: '#adf2e0',
	},
	midnight: {
		gradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
		label: 'Midnight',
		swatch: '#203a43',
	},
	sunset: {
		gradient: 'linear-gradient(135deg, #f5a623, #f53d7f, #9b59b6)',
		label: 'Sunset',
		swatch: '#f5a623',
	},
	aurora: {
		gradient: 'linear-gradient(135deg, #43b89c, #2d4e8a, #9b59b6)',
		label: 'Aurora',
		swatch: '#43b89c',
	},
	rose: {
		gradient: 'linear-gradient(135deg, #f093fb, #f5576c, #c471ed)',
		label: 'Rose',
		swatch: '#f093fb',
	},
} as const;

export type ThemeName = keyof typeof THEMES;
