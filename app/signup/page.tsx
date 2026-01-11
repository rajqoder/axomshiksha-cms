'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, CardContent, Typography, TextField, Button, Link, Alert, CircularProgress, Snackbar, Alert as MuiAlert, InputAdornment } from '@mui/material';
import { User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const router = useRouter();
  const { signUp, user } = useAuth();

  React.useEffect(() => {
    if (user) {
      router.push('/'); // Redirect to home if already logged in
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Call signUp with display name in user metadata
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setError(error.message);
      } else {
        // Show success message
        setSnackbarMessage('Account created successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
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
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Create account</Typography>
            <Typography variant="body2" color="text.secondary">Sign up to get started</Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              title='Enter your name'
              label="Display Name"
              variant="outlined"
              margin="dense"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />

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

            <TextField
              fullWidth
              title='Confirm your password'
              label="Confirm Password"
              variant="outlined"
              margin="dense"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? <CircularProgress size={20} /> : 'Sign Up'}
            </Button>
          </form>

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

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link href="/login" underline="hover">
                Sign in here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignupPage;