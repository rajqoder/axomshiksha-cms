'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Container,
  TextField,
  Button,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  InputAdornment,
  MenuItem
} from '@mui/material';
import {
  Trash2,
  Plus,
  Save,
  Twitter,
  Link as LinkIcon,
  Facebook,
  Instagram,
  Youtube,
  Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getWriterProfile, updateWriterProfile, WriterProfile, SocialLink } from '../../actions/writerProfile';

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState<WriterProfile>({
    username: '',
    name: '',
    bio: '',
    joinedon: '',
    social_links: [],
    email: ''
  });

  const [joinedDate, setJoinedDate] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getWriterProfile();
        if (response.success && response.data) {
          setProfile(response.data);
          if (response.data.joinedon) {
            setJoinedDate(response.data.joinedon);
          } else if (user?.created_at) {
            setJoinedDate(user.created_at.split('T')[0]);
          }
        } else {
          setError(response.message || 'Failed to load profile');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (field: keyof WriterProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...profile.social_links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setProfile(prev => ({ ...prev, social_links: newLinks }));
  };

  const SOCIAL_PLATFORMS = ['website', 'twitter', 'facebook', 'instagram', 'youtube'];

  const addSocialLink = () => {
    const usedPlatforms = new Set(profile.social_links?.map(l => l.platform) || []);
    const nextAvailable = SOCIAL_PLATFORMS.find(p => !usedPlatforms.has(p));

    if (nextAvailable) {
      setProfile(prev => ({
        ...prev,
        social_links: [...(prev.social_links || []), { platform: nextAvailable, url: '' }]
      }));
    }
  };

  const removeSocialLink = (index: number) => {
    const newLinks = (profile.social_links || []).filter((_, i) => i !== index);
    setProfile(prev => ({ ...prev, social_links: newLinks }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedProfile = {
        ...profile,
        joinedon: joinedDate
      };

      const response = await updateWriterProfile(updatedProfile);

      if (response.success) {
        setSuccess(response.message);
        setProfile(updatedProfile);
      } else {
        setError(response.message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return <Twitter size={20} />;
      case 'facebook': return <Facebook size={20} />;
      case 'instagram': return <Instagram size={20} />;
      case 'youtube': return <Youtube size={20} />;
      case 'website': return <Globe size={20} />;
      default: return <LinkIcon size={20} />;
    }
  };

  if (!user) return null; // Or redirect to login

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Edit Profile
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Display Name"
                      value={profile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Joined On"
                      type="date"
                      value={joinedDate}
                      disabled
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={4}
                      value={profile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us a little about yourself..."
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Social Media Links</Typography>
                  <Button
                    startIcon={<Plus size={18} />}
                    onClick={addSocialLink}
                    variant="outlined"
                    size="small"
                    disabled={profile.social_links?.length >= SOCIAL_PLATFORMS.length}
                  >
                    Add Link
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {profile.social_links?.map((link, index) => (
                    <Grid container spacing={2} key={index} alignItems="flex-start">
                      <Grid size={{ xs: 4, sm: 3 }}>
                        <TextField
                          select
                          fullWidth
                          label="Platform"
                          value={link.platform}
                          onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                        >
                          {SOCIAL_PLATFORMS.map((platform) => {
                            const isUsed = profile.social_links?.some((l, i) => i !== index && l.platform === platform);
                            return (
                              <MenuItem key={platform} value={platform} disabled={!!isUsed}>
                                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                              </MenuItem>
                            );
                          })}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 7, sm: 8 }}>
                        <TextField
                          fullWidth
                          label="URL"
                          value={link.url}
                          onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {getPlatformIcon(link.platform)}
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 1 }}>
                        <IconButton onClick={() => removeSocialLink(index)} color="error">
                          <Trash2 size={20} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  {(!profile.social_links || profile.social_links.length === 0) && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No social links added yet.
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Update Profile'}
                </Button>
              </Box>
            </Stack>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;