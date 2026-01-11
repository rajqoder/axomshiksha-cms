'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import Link from 'next/link';

const HomePage = () => {
  return (
    <Box sx={{ pt: 10, pb: 4, minHeight: 'calc(100vh - 120px)', px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Hero Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 8,
        py: 6,
        px: { xs: 2, md: 4 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        mx: 'auto',
        maxWidth: 'lg'
      }}>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Welcome to AxomShiksha CMS
        </Typography>
        <Typography 
          variant="h6" 
          align="center" 
          color="textSecondary" 
          paragraph
          sx={{ maxWidth: '600px', mx: 'auto', fontSize: { xs: '1rem', md: '1.1rem' } }}
        >
          Manage your posts with ease
        </Typography>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 4, 
        justifyContent: 'center', 
        mt: 4,
        maxWidth: 'lg',
        mx: 'auto'
      }}>
        <Card 
          sx={{ 
            minWidth: 300,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: 4
            }
          }}
        >
          <CardContent sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                mr: 2, 
                width: 48, 
                height: 48, 
                bgcolor: 'primary.main', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Typography variant="h5" component="span" sx={{ color: 'white', fontWeight: 'bold' }}>📝</Typography>
              </Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Create Content
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6 }}>
              Write new articles and educational materials in Assamese with our intuitive editor.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button 
              variant="contained" 
              size="small" 
              component={Link} 
              href="/new-post"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Create Post
            </Button>
          </CardActions>
        </Card>
        
        <Card 
          sx={{ 
            minWidth: 300,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: 4
            }
          }}
        >
          <CardContent sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                mr: 2, 
                width: 48, 
                height: 48, 
                bgcolor: 'secondary.main', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Typography variant="h5" component="span" sx={{ color: 'white', fontWeight: 'bold' }}>📋</Typography>
              </Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Manage Posts
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6 }}>
              View, edit, and organize your existing content with advanced filtering options.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button 
              variant="contained" 
              size="small" 
              component={Link} 
              href="/posts"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              View Posts
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Box>
  );
};

export default HomePage;