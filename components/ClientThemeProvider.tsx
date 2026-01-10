'use client';

import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

interface ClientThemeProviderProps {
  children: React.ReactNode;
}

// Create a fixed dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#e57373',
    },
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
    text: {
      primary: '#ededed',
      secondary: '#aaaaaa',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

export const ClientThemeProvider: React.FC<ClientThemeProviderProps> = ({ children }) => {
  return (
    <MuiThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div 
        style={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#121212',
          color: '#ededed',
        }}
      >
        {children}
      </div>
    </MuiThemeProvider>
  );
};