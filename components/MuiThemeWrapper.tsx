'use client';

import React from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline, createTheme } from '@mui/material';

// Create a simple dark theme as per the example
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export const MuiThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <MuiThemeProvider theme={darkTheme} defaultMode='dark'>
      <CssBaseline enableColorScheme/>
      {children}
    </MuiThemeProvider>
  );
};