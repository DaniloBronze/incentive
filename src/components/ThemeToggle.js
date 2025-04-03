import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { themeMode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  
  return (
    <Tooltip title={themeMode === 'light' ? 'Modo escuro' : 'Modo claro'}>
      <IconButton 
        onClick={toggleTheme} 
        color="inherit"
        aria-label="alternar tema"
        sx={{ 
          color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'rotate(12deg)',
          }
        }}
      >
        {themeMode === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle; 