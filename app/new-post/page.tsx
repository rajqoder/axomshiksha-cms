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
} from '@mui/material';
import TagSelector from '@/components/TagSelector';
import KeywordsInput from '@/components/KeywordsInput';
import { CATEGORIES, CATEGORY_MAP } from '../CONSTANT';
import MarkdownEditor from '@/components/MarkdownEditor';

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
    <Box sx={{ flex: 1, bgcolor: 'background.paper', pt: 12, pb: 3, px: 4 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', gap: 3, px: 2 }}>
          <Box sx={{ flex: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            {/* Author Guidelines */}
            <Paper sx={{ mb: 2, backgroundColor: 'background.default' }}>
              <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Author Guidelines</AlertTitle>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Image size should not exceed 50kb for optimal loading</li>
                  <li>Recommended image dimensions: 900 x 450 pixels</li>
                  <li>Use descriptive alt text for accessibility</li>
                  <li>Include relevant keywords for SEO</li>
                  <li>Proofread content before publishing</li>
                </ul>
              </Alert>
            </Paper>
            
            {/* Metadata Guide */}
            <Paper sx={{ mb: 2, backgroundColor: 'background.default' }}>
              <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Post Metadata Guide</AlertTitle>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li><strong>Title</strong>: Main headline of your post, shown in search results and social shares</li>
                  <li><strong>Slug</strong>: URL-friendly version of title (e.g., "my-awesome-post")</li>
                  <li><strong>Description</strong>: Brief summary used for meta description and search previews</li>
                  <li><strong>Category</strong>: Organizes content for navigation and filtering</li>
                  <li><strong>Tags</strong>: Keywords for content discovery and related posts</li>
                  <li><strong>Reading Time</strong>: Estimated minutes to read the post</li>
                  <li><strong>Thumbnail URL</strong>: Featured image for post listings and social sharing</li>
                  <li><strong>Keywords</strong>: SEO terms for improved search visibility</li>
                </ul>
              </Alert>
            </Paper>
            
            <Controller
              name="content"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 4, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ height: '100%', overflow: 'auto', pr: 1 }}>
              <TextField
                fullWidth
                label="Title"
                variant="outlined"
                margin="normal"
                {...register('title', { required: 'Title is required' })}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
              <TextField
                fullWidth
                label="Slug"
                variant="outlined"
                margin="normal"
                {...register('slug', { required: 'Slug is required' })}
                error={!!errors.slug}
                helperText={errors.slug?.message}
              />
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                margin="normal"
                multiline
                rows={4}
                {...register('description')}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Category"
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
              margin="normal"
              type="number"
              {...register('readingTime', { valueAsNumber: true })}
            />
            <TextField
              fullWidth
              label="Thumbnail URL"
              variant="outlined"
              margin="normal"
              {...register('thumbnail')}
            />
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
            </Box>
            <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
              <Button
                type="button"
                variant="contained"
                color="primary"
                size="large"
                onClick={() => handleSubmit((data) => onSubmit({...data, published: false}))()}
              >
                Save Draft
              </Button>
              <Button
                type="button"
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => handleSubmit((data) => onSubmit({...data, published: true}))()}
              >
                Publish
              </Button>
            </Box>
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
  );
};

export default NewPostPage;