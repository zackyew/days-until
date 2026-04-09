import React, { useCallback, useEffect, useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { THEMES, ThemeName } from '../themes';

const DEFAULT_THEME: ThemeName = 'midnight';

const SelectorBox = styled(Box)({
	position: 'absolute',
	top: 12,
	right: 12,
	display: 'flex',
	gap: 8,
	alignItems: 'center',
	background: 'rgba(0,0,0,0.15)',
	backdropFilter: 'blur(8px)',
	WebkitBackdropFilter: 'blur(8px)',
	borderRadius: 20,
	padding: '6px 10px',
});

interface SwatchProps {
	swatchColor: string;
	isSelected: boolean;
}

const Swatch = styled(Box, {
	shouldForwardProp: (prop) => prop !== 'swatchColor' && prop !== 'isSelected',
})<SwatchProps>(({ swatchColor, isSelected }) => ({
	width: 22,
	height: 22,
	borderRadius: '50%',
	background: swatchColor,
	cursor: 'pointer',
	border: isSelected ? '2px solid white' : '2px solid transparent',
	boxShadow: isSelected ? '0 0 0 1px rgba(0,0,0,0.3)' : 'none',
	opacity: isSelected ? 1 : 0.6,
	transition: 'opacity 0.15s, transform 0.15s',
	'&:hover': {
		opacity: 1,
		transform: 'scale(1.15)',
	},
}));

const ThemeSelector = () => {
	const [selected, setSelected] = useState<ThemeName>(
		() => (localStorage.getItem('theme') as ThemeName) ?? DEFAULT_THEME
	);

	useEffect(() => {
		const handler = () => {
			setSelected((localStorage.getItem('theme') as ThemeName) ?? DEFAULT_THEME);
		};
		window.addEventListener('days-until', handler);
		return () => window.removeEventListener('days-until', handler);
	}, []);

	const handleSelect = useCallback((name: ThemeName) => {
		localStorage.setItem('theme', name);
		setSelected(name);
		window.dispatchEvent(new Event('days-until'));
	}, []);

	return (
		<SelectorBox>
			{(Object.entries(THEMES) as [ThemeName, typeof THEMES[ThemeName]][]).map(
				([name, theme]) => (
					<Tooltip key={name} title={theme.label} placement='bottom'>
						<Swatch
							swatchColor={theme.gradient}
							isSelected={selected === name}
							onClick={() => handleSelect(name)}
						/>
					</Tooltip>
				)
			)}
		</SelectorBox>
	);
};

export default ThemeSelector;
