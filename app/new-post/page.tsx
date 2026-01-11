'use client';

import React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Typography,
  Divider,
} from '@mui/material';
import TagSelector from '@/components/TagSelector';
import KeywordsInput from '@/components/KeywordsInput';
import { CATEGORIES, CATEGORY_MAP } from '../CONSTANT';
import MarkdownEditor from '@/components/MarkdownEditor';
import { FileText, Save, Send, Info, BookOpen } from 'lucide-react';

interface FormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  published: boolean;
  readingTime: number;
  thumbnail: string;
  useTagsAsKeywords: boolean;
  keywords: string[];
}

const NewPostPage = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      category: '',
      tags: [],
      content: '',
      published: false,
      readingTime: 5,
      thumbnail: '',
      useTagsAsKeywords: false,
      keywords: [],
    }
  });

  const useTagsAsKeywords = useWatch({
    control,
    name: 'useTagsAsKeywords',
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Dynamically import the server action
      const { createPost } = await import('../../actions/createPost');
      const result = await createPost(data);
      if (result && result.success) {
        setSnackbarMessage(result.message);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        // Reset form after successful submission
        reset();
      } else {
        setSnackbarMessage(result?.message || 'An unknown error occurred');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSnackbarMessage('An unexpected error occurred. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      pt: 10, 
      pb: 4, 
      px: { xs: 2, sm: 3, md: 4 } 
    }}>
      <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              background: 'linear-gradient(45deg, #60a5fa, #3b82f6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Create New Post
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Write and publish your content with our intuitive editor
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
            {/* Main Content Area */}
            <Box sx={{ flex: { xs: 1, lg: 8 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Guidelines Cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(30, 30, 30, 0.8) 100%)',
                  border: '1px solid rgba(96, 165, 250, 0.2)',
                  borderRadius: 3,
                  boxShadow: '0 2px 6px rgba(96, 165, 250, 0.1)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Info size={20} color="#60a5fa" />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#60a5fa' }}>
                        Author Guidelines
                      </Typography>
                    </Box>
                    <Box component="ul" sx={{ m: 0, pl: 3, color: 'text.secondary', '& li': { mb: 1 } }}>
                      <li>Image size should not exceed 50kb for optimal loading</li>
                      <li>Recommended image dimensions: 900 x 450 pixels</li>
                      <li>Use descriptive alt text for accessibility</li>
                      <li>Include relevant keywords for SEO</li>
                      <li>Proofread content before publishing</li>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(30, 30, 30, 0.8) 100%)',
                  border: '1px solid rgba(96, 165, 250, 0.2)',
                  borderRadius: 3,
                  boxShadow: '0 2px 6px rgba(96, 165, 250, 0.1)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <BookOpen size={20} color="#60a5fa" />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#60a5fa' }}>
                        Post Metadata Guide
                      </Typography>
                    </Box>
                    <Box component="ul" sx={{ m: 0, pl: 3, color: 'text.secondary', '& li': { mb: 1 } }}>
                      <li><strong>Title</strong>: Main headline of your post</li>
                      <li><strong>Slug</strong>: URL-friendly version (e.g., "my-awesome-post")</li>
                      <li><strong>Description</strong>: Brief summary for search previews</li>
                      <li><strong>Category</strong>: Organizes content for navigation</li>
                      <li><strong>Tags</strong>: Keywords for content discovery</li>
                      <li><strong>Reading Time</strong>: Estimated minutes to read</li>
                      <li><strong>Thumbnail URL</strong>: Featured image for listings</li>
                      <li><strong>Keywords</strong>: SEO terms for search visibility</li>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              
              {/* Markdown Editor */}
              <Card sx={{ 
                flex: 1,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(30, 30, 30, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '600px'
              }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                  <Controller
                    name="content"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <MarkdownEditor
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </Box>
                    )}
                  />
                </CardContent>
              </Card>
            </Box>

            {/* Sidebar */}
            <Box sx={{ flex: { xs: 1, lg: 4 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(30, 30, 30, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                position: 'sticky',
                top: 100,
                maxHeight: 'calc(100vh - 120px)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  p: 3,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  scrollbarWidth: 'thin',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <FileText size={20} color="#60a5fa" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Post Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Title"
                      variant="outlined"
                      {...register('title', { required: 'Title is required' })}
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255, 255, 255, 0.03)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                          },
                        }
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Slug"
                      variant="outlined"
                      {...register('slug', { required: 'Slug is required' })}
                      error={!!errors.slug}
                      helperText={errors.slug?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255, 255, 255, 0.03)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                          },
                        }
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Description"
                      variant="outlined"
                      multiline
                      rows={3}
                      {...register('description')}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255, 255, 255, 0.03)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                          },
                        }
                      }}
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Category"
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.03)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                              },
                            }}
                          >
                            {CATEGORIES.map((category: string) => (
                              <MenuItem key={category} value={category}>
                                {CATEGORY_MAP[category] || category}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>
                    
                    <Controller
                      name="tags"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TagSelector
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                    
                    <TextField
                      fullWidth
                      label="Reading Time (minutes)"
                      variant="outlined"
                      type="number"
                      {...register('readingTime', { valueAsNumber: true })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255, 255, 255, 0.03)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                          },
                        }
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Thumbnail URL"
                      variant="outlined"
                      {...register('thumbnail')}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255, 255, 255, 0.03)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                          },
                        }
                      }}
                    />
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Controller
                      name="useTagsAsKeywords"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label="Use tags as keywords"
                        />
                      )}
                    />
                    
                    {!useTagsAsKeywords && (
                      <Controller
                        name="keywords"
                        control={control}
                        render={({ field, fieldState }) => (
                          <KeywordsInput
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                          />
                        )}
                      />
                    )}
                  </Box>
                </CardContent>
                
                <Box sx={{ p: 3, pt: 0, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mt: 2 }}>
                    <Button
                      type="button"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={isSubmitting}
                      onClick={() => handleSubmit((data) => onSubmit({...data, published: false}))()}
                      startIcon={<Save size={18} />}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                        boxShadow: '0 2px 6px rgba(96, 165, 250, 0.2)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          boxShadow: '0 3px 8px rgba(96, 165, 250, 0.25)',
                        }
                      }}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button
                      type="button"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={isSubmitting}
                      onClick={() => handleSubmit((data) => onSubmit({...data, published: true}))()}
                      startIcon={<Send size={18} />}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                        boxShadow: '0 2px 6px rgba(96, 165, 250, 0.2)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          boxShadow: '0 3px 8px rgba(96, 165, 250, 0.25)',
                        }
                      }}
                    >
                      {isSubmitting ? 'Publishing...' : 'Publish'}
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Box>
        </form>
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default NewPostPage;