'use client';

import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          © {new Date().getFullYear()} AxomShiksha CMS. All rights reserved.
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ opacity: 0.7, fontStyle: 'italic' }}>
          Made for axomshiksha.com
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;