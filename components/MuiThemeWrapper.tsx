"use client"
import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0f0f10',
      paper: '#1a1a1b'
    },
    primary: {
      main: '#60a5fa'
    },
    secondary: {
      main: '#f59e0b'
    },
    text: {
      primary: '#e5e7eb',
      secondary: '#9ca3af'
    },
    divider: 'rgba(255,255,255,0.08)'
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backdropFilter: 'saturate(180%) blur(8px)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1b',
          border: '1px solid rgba(255,255,255,0.08)'
        }
      }
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent'
        }
      }
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained'
      }
    }
  },
});

export const MuiThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {mounted && <CssBaseline />}
      {children}
    </ThemeProvider>
  );
};