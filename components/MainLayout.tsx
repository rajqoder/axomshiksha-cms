'use client';

import React from 'react';
import { Container, Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { MuiThemeWrapper } from './MuiThemeWrapper';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <MuiThemeWrapper>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
          }}
        >
          <Header />
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {children}
          </Box>
          <Footer />
        </Box>
      </MuiThemeWrapper>
    </AuthProvider>
  );
};

export default MainLayout;
