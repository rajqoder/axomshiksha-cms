'use client';

import { Box, Paper, Typography, Container } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 120px)',
      py: 4
    }}>
      <Paper elevation={3} sx={{ 
        padding: 4, 
        width: '100%',
        maxWidth: 600
      }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: 'primary.main', mb: 0.5 }}>
          My Profile
        </Typography>
        
        <Box>
          <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mb: 3 }}>
            Personal Information
          </Typography>
          
          <Typography variant="body1">
            <strong>Name:</strong> {user?.user_metadata?.display_name || 'Not set'}
          </Typography>
          
          <Typography variant="body1">
            <strong>Email:</strong> {user?.email || 'Not available'}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;