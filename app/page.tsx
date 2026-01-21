'use client';

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import Link from 'next/link';
import { FileText, List, ArrowRight, Sparkles } from 'lucide-react';

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
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            boxShadow: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6,
            }
          }}
        >
          <CardContent sx={{ flex: 1, p: 3, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <Box
                className="card-icon"
                sx={{
                  mr: 2,
                  width: 64,
                  height: 64,
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(96, 165, 250, 0.15)',
                }}
              >
                <FileText size={32} color="white" strokeWidth={2.5} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700, fontSize: '1.5rem', mb: 1 }}>
                  Create Content
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
                  Write new articles and educational materials in Assamese with our intuitive markdown editor. Rich formatting, media support, and seamless publishing.
                </Typography>
              </Box>
            </Box>

            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 3,
              p: 2,
              bgcolor: 'rgba(96, 165, 250, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(96, 165, 250, 0.1)'
            }}>
              <Sparkles size={16} color="#60a5fa" />
              <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 500 }}>
                Advanced markdown editor with live preview
              </Typography>
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', p: 3, pt: 0, position: 'relative', zIndex: 1 }}>
            <Button
              className="card-button"
              variant="contained"
              size="medium"
              component={Link}
              href="/new-post"
              endIcon={<ArrowRight size={18} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                boxShadow: '0 2px 6px rgba(96, 165, 250, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: '0 3px 8px rgba(96, 165, 250, 0.25)',
                }
              }}
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
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            boxShadow: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6,
            }
          }}
        >
          <CardContent sx={{ flex: 1, p: 3, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <Box
                className="card-icon"
                sx={{
                  mr: 2,
                  width: 64,
                  height: 64,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.15)',
                }}
              >
                <List size={32} color="white" strokeWidth={2.5} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700, fontSize: '1.5rem', mb: 1 }}>
                  Manage Posts
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
                  View, edit, and organize your existing content with advanced filtering options. Bulk operations and comprehensive analytics.
                </Typography>
              </Box>
            </Box>

            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 3,
              p: 2,
              bgcolor: 'rgba(245, 158, 11, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(245, 158, 11, 0.1)'
            }}>
              <Sparkles size={16} color="#f59e0b" />
              <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 500 }}>
                Powerful data grid with sorting and filtering
              </Typography>
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', p: 3, pt: 0, position: 'relative', zIndex: 1 }}>
            <Button
              className="card-button"
              variant="contained"
              size="medium"
              component={Link}
              href="/posts"
              endIcon={<ArrowRight size={18} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  boxShadow: '0 3px 8px rgba(245, 158, 11, 0.25)',
                }
              }}
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