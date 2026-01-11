'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, CardContent, Typography, TextField, Button, Link, Alert, CircularProgress, Snackbar, Alert as MuiAlert, InputAdornment } from '@mui/material';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const router = useRouter();
  const { signIn, user } = useAuth(); // signIn(email, password)

  React.useEffect(() => {
    if (user) {
      router.push('/'); // Redirect to home if already logged in
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        // Show success message
        setSnackbarMessage('Login successful!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        router.push('/'); // Redirect to home after successful login
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)',
        pt: 8,
        px: 2,
      }}
    >
      <Card elevation={0} sx={{ width: '100%', maxWidth: 380, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Welcome back</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to your account</Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              title='Enter your email'
              label="Email"
              variant="outlined"
              margin="dense"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextField
              fullWidth
              title='Enter your password'
              label="Password"
              variant="outlined"
              margin="dense"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="medium"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={20} /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link href="/signup" underline="hover">
                Sign up here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;