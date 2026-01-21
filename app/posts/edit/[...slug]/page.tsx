'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Snackbar,
    Alert,
    Card,
    CardContent,
    Divider,
    CircularProgress,
} from '@mui/material';
import KeywordsInput from '@/components/KeywordsInput';
// Removed legacy CATEGORIES/CATEGORY_MAP imports as we use dynamic taxonomy now
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MarkdownEditor, { MarkdownEditorRef } from '@/components/MarkdownEditor';
import ShortcodeToolbar from '@/components/ShortcodeToolbar';
import { fetchPostBySlug } from '@/actions/fetchPost';
import { getSubjects, getTaxonomy, Subject, Taxonomy } from '@/actions/cms/metadata';
import { getSyllabus, Syllabus } from '@/actions/cms/syllabus';
import { FileText, Save, Send, ArrowLeft, Edit, Layers } from 'lucide-react';

interface FormData {
    title: string;
    slug: string;
    description: string;

    // Taxonomy
    category: string;
    class: string;
    subject: string;
    medium: string;
    chapter_title: string;

    content: string;
    published: boolean;
    readingTime: number;
    thumbnail: string;
    keywords: string[];
}

const MEDIUM_OPTIONS = [
    { label: 'English', value: 'english' },
    { label: 'Assamese', value: 'assamese' },
];

const EditPostPage = () => {
    const params = useParams();
    const slugParams = params.slug;

    // Metadata State
    const [taxonomy, setTaxonomy] = useState<Taxonomy>({});
    const [subjectsMap, setSubjectsMap] = useState<Record<string, Subject>>({});
    const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
    const [loadingSyllabus, setLoadingSyllabus] = useState(false);

    const [initialData, setInitialData] = useState<FormData | null>(null);
    const [loading, setLoading] = useState(true);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<FormData>({
        defaultValues: {
            title: '', slug: '', description: '', content: '',
            class: '', subject: '', medium: '', chapter_title: '',
            category: '', keywords: [],
            published: false, readingTime: 5, thumbnail: ''
        }
    });

    // Watch fields for dynamic updates
    const selectedCategory = watch('category');
    const selectedClass = watch('class');
    const selectedSubject = watch('subject');
    const selectedMedium = watch('medium');

    const isLanguageSubject = selectedSubject ? subjectsMap[selectedSubject]?.isLanguageSubject : false;

    // Fetch Metadata on Mount
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [tax, subs] = await Promise.all([
                    getTaxonomy(),
                    getSubjects()
                ]);
                setTaxonomy(tax);
                setSubjectsMap(subs);
            } catch (err) {
                console.error("Failed to load metadata", err);
            }
        };
        fetchMetadata();
    }, []);

    // Load Post Data
    useEffect(() => {
        const loadPost = async () => {
            if (slugParams) {
                const slugValue = Array.isArray(slugParams) ? slugParams.join('/') : slugParams;
                const postData = await fetchPostBySlug(slugValue);

                if (postData) {
                    // Extract leaf slug from full path if needed, but for editing we might default to filename?
                    // User wants "slug" field to be editable.
                    // If post is "class-6/english/lesson-1", slug field should probably show "lesson-1".

                    let leafSlug = postData.slug;
                    if (leafSlug.includes('/')) {
                        const parts = leafSlug.split('/');
                        leafSlug = parts[parts.length - 1]; // "lesson-1"
                    }

                    // Normalize Subject
                    let normalizedSubject = postData.subject || '';
                    if (normalizedSubject && Object.keys(subjectsMap).length > 0) {
                        const match = Object.keys(subjectsMap).find(key =>
                            key.toLowerCase() === normalizedSubject.toLowerCase()
                        );
                        if (match) normalizedSubject = match;
                    }

                    // Normalize Category
                    let normalizedCategory = postData.category || '';
                    if (normalizedCategory && Object.keys(taxonomy).length > 0) {
                        const taxKeys = Object.keys(taxonomy);
                        const match = taxKeys.find(key =>
                            key.toLowerCase() === normalizedCategory.toLowerCase() ||
                            key.toLowerCase() === normalizedCategory.toLowerCase().replace(/\s+/g, '-')
                        );
                        if (match) normalizedCategory = match;
                    }

                    // Normalize Medium
                    const normalizedMedium = postData.medium || '';

                    const formData: FormData = {
                        title: postData.title,
                        slug: leafSlug, // Show only the name part
                        description: postData.description,

                        category: normalizedCategory,
                        class: postData.class || '',
                        subject: normalizedSubject,
                        medium: normalizedMedium,
                        chapter_title: postData.chapter_title || '',

                        content: postData.content,
                        published: postData.published,
                        readingTime: typeof postData.readingTime === 'number' ? postData.readingTime : parseInt(postData.readingTime as string) || 5,
                        thumbnail: postData.thumbnail,
                        keywords: Array.isArray(postData.keywords) ? postData.keywords : (typeof postData.keywords === 'string' ? [postData.keywords] : []),
                    };

                    setInitialData(formData);
                    reset(formData);
                }
                setLoading(false);
            }
        };

        if (Object.keys(taxonomy).length > 0 && Object.keys(subjectsMap).length > 0) {
            loadPost();
        }
    }, [slugParams, reset, taxonomy, subjectsMap]);

    // Cascading Logic: Reset downstream fields (Only if user interacts, but we need to be careful not to wipe initial data on first load)
    // We can use a ref to track if initial load is done? Or just rely on useEffect dependencies.
    // Issue: When reset(formData) runs, it sets values. This triggers existing watchers?
    // Actually, react-hook-form's reset doesn't trigger watchers in a way that causes infinite loops usually, but our side-effect useEffects might.

    // We need to avoid resetting if the change came from 'reset' (initial load).
    // Simple check: if initialData is matched, maybe don't wipe? 
    // Better: Only wipe if the Value changed AND it's not the initial set.

    // For now, let's keep it simple but careful.

    // Fetch Syllabus when Class/Subject changes
    useEffect(() => {
        if (selectedClass && selectedSubject && selectedCategory) {
            // Only fetch if meaningful
            if (initialData && selectedClass === initialData.class && selectedSubject === initialData.subject && !syllabus) {
                // Initial load phase, fetch syllabus but don't wipe chapter
            }

            setLoadingSyllabus(true);
            getSyllabus(selectedClass, selectedSubject, selectedCategory)
                .then(data => {
                    setSyllabus(data);
                })
                .catch(err => {
                    console.error("Failed to load syllabus", err);
                    setSyllabus(null);
                })
                .finally(() => setLoadingSyllabus(false));
        } else {
            setSyllabus(null);
        }
    }, [selectedClass, selectedSubject, selectedCategory]);


    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
    const markdownEditorRef = useRef<MarkdownEditorRef>(null);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const { createPost } = await import('@/actions/createPost');
            const result = await createPost(data);
            if (result && result.success) {
                setSnackbarMessage(result.message);
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
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

    // Derived Options
    const categoryOptions = Object.keys(taxonomy || {});
    // If category is selected, get classes. If not, empty.
    const classOptions = selectedCategory ? (taxonomy[selectedCategory] ? Object.keys(taxonomy[selectedCategory]) : []) : [];
    // If class selected, get subjects.
    const subjectOptions = (selectedCategory && selectedClass && taxonomy[selectedCategory]) ? (taxonomy[selectedCategory][selectedClass] || []) : [];

    if (loading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2
            }}>
                <CircularProgress size={48} />
                <Typography variant="h6" color="textSecondary">
                    Loading Post...
                </Typography>
            </Box>
        );
    }

    if (!initialData) {
        return (
            <Box sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                pt: 10,
                pb: 4,
                px: { xs: 2, sm: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3
            }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Post not found
                </Typography>
                <Button
                    variant="contained"
                    component={Link}
                    href="/posts"
                    startIcon={<ArrowLeft size={18} />}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Back to Posts
                </Button>
            </Box>
        );
    }

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
                <Box sx={{ mb: 4 }}>
                    <Button
                        component={Link}
                        href="/posts"
                        startIcon={<ArrowLeft size={18} />}
                        variant="outlined"
                        sx={{
                            mb: 2,
                            textTransform: 'none',
                            color: 'text.primary',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                            }
                        }}
                    >
                        Back to Posts
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(96, 165, 250, 0.2)',
                        }}>
                            <Edit size={24} color="white" />
                        </Box>
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                                    background: 'linear-gradient(45deg, #60a5fa, #3b82f6)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Edit Post
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                {initialData.title}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>

                        {/* Main Content Area */}
                        <Box sx={{ flex: { xs: 1, lg: 8 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

                            {/* Metadata Selection Card (New) */}
                            <Card sx={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(30, 30, 30, 0.9) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 3,
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                        <Layers size={20} color="#60a5fa" />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Class & Subject Context
                                        </Typography>
                                    </Box>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                                        <FormControl fullWidth size="small">
                                            <InputLabel>Category</InputLabel>
                                            <Select label="Category" {...register('category', { required: true })} value={selectedCategory || ''} onChange={e => {
                                                setValue('category', e.target.value);
                                                // Reset downstream
                                                setValue('class', '');
                                                setValue('subject', '');
                                                setValue('chapter_title', '');
                                            }}>
                                                {categoryOptions.map(cat => (
                                                    <MenuItem key={cat} value={cat}>{cat.replace(/-/g, ' ').toUpperCase()}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth size="small" disabled={!selectedCategory}>
                                            <InputLabel>Class</InputLabel>
                                            <Select label="Class" {...register('class')} value={selectedClass || ''} onChange={e => {
                                                setValue('class', e.target.value);
                                                // Reset downstream
                                                setValue('subject', '');
                                                setValue('chapter_title', '');
                                            }}>
                                                {classOptions.map(cls => (
                                                    <MenuItem key={cls} value={cls}>{cls.replace(/-/g, ' ').toUpperCase()}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth size="small" disabled={!selectedClass}>
                                            <InputLabel>Subject</InputLabel>
                                            <Select label="Subject" {...register('subject')} value={selectedSubject || ''} onChange={e => {
                                                setValue('subject', e.target.value);
                                                setValue('chapter_title', '');
                                            }}>
                                                {subjectOptions.map(subSlug => {
                                                    const subjectMeta = subjectsMap[subSlug];
                                                    const label = subjectMeta?.title || subSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                                    return <MenuItem key={subSlug} value={subSlug}>{label}</MenuItem>;
                                                })}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth size="small" disabled={!!isLanguageSubject}>
                                            <InputLabel>Medium</InputLabel>
                                            <Select label="Medium" {...register('medium')} value={selectedMedium || ''} onChange={e => setValue('medium', e.target.value)}>
                                                {MEDIUM_OPTIONS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                                            </Select>
                                        </FormControl>

                                        {/* Row 2 for Chapter if needed, or stick to grid */}
                                        <FormControl fullWidth size="small" disabled={!syllabus || loadingSyllabus} sx={{ gridColumn: '1 / -1' }}>
                                            <InputLabel>{loadingSyllabus ? "Loading..." : "Chapter"}</InputLabel>
                                            <Controller
                                                name="chapter_title"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select label="Chapter" {...field} value={field.value || ''}>
                                                        <MenuItem value=""><em>None</em></MenuItem>
                                                        {syllabus?.chapters?.map((ch, idx) => {
                                                            const val = ch.title || ch.title_as || '';
                                                            if (!val) return null;

                                                            return (
                                                                <MenuItem key={idx} value={val}>
                                                                    {val}
                                                                    {selectedMedium === 'assamese' && ch.title && ch.title_as ? ` (${ch.title_as})` : ''}
                                                                </MenuItem>
                                                            );
                                                        })}
                                                    </Select>
                                                )}
                                            />
                                        </FormControl>
                                    </div>
                                </CardContent>
                            </Card>

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
                                <ShortcodeToolbar
                                    onInsert={(shortcode) => {
                                        if (markdownEditorRef.current) {
                                            markdownEditorRef.current.insertText(shortcode);
                                        }
                                    }}
                                />
                                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                                    <Controller
                                        name="content"
                                        control={control}
                                        render={({ field }) => (
                                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <MarkdownEditor
                                                    ref={markdownEditorRef}
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
                                    '&::-webkit-scrollbar': { width: '8px' },
                                    '&::-webkit-scrollbar-track': { background: 'transparent' },
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
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Slug"
                                            variant="outlined"
                                            {...register('slug', { required: 'Slug is required' })}
                                            error={!!errors.slug}
                                            helperText={errors.slug?.message}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Description"
                                            variant="outlined"
                                            multiline
                                            rows={3}
                                            {...register('description')}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Reading Time (minutes)"
                                            variant="outlined"
                                            type="number"
                                            {...register('readingTime', { valueAsNumber: true })}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Thumbnail URL"
                                            variant="outlined"
                                            {...register('thumbnail')}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }}
                                        />

                                        <Divider sx={{ my: 1 }} />

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
                                            onClick={() => handleSubmit((data) => onSubmit({ ...data, published: false }))()}
                                            startIcon={<Save size={18} />}
                                            sx={{
                                                textTransform: 'none', fontWeight: 600,
                                                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
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
                                            onClick={() => handleSubmit((data) => onSubmit({ ...data, published: true }))()}
                                            startIcon={<Send size={18} />}
                                            sx={{
                                                textTransform: 'none', fontWeight: 600,
                                                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                                            }}
                                        >
                                            {isSubmitting ? 'Publishing...' : 'Publish'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            fullWidth
                                            component={Link}
                                            href="/posts"
                                            startIcon={<ArrowLeft size={18} />}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                                color: 'text.primary'
                                            }}
                                        >
                                            Cancel
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
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default EditPostPage;
