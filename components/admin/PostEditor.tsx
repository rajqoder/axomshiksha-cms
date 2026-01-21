'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Box, Button, TextField, FormControl, InputLabel, Select, MenuItem,
    Snackbar, Alert, Card, CardContent,
    Typography, Divider
} from '@mui/material';
import KeywordsInput from '@/components/KeywordsInput';
import MarkdownEditor, { MarkdownEditorRef } from '@/components/MarkdownEditor';
import ShortcodeToolbar from '@/components/ShortcodeToolbar';
import { FileText, Save, Send, Layers } from 'lucide-react';

// Actions
import { createPost } from '@/actions/createPost';
import { getSyllabus, Syllabus } from '@/actions/cms/syllabus';
import { Subject, Taxonomy } from '@/actions/cms/metadata';

interface PostEditorProps {
    subjects: Record<string, Subject>;
    taxonomy: Taxonomy;
}

interface AdminFormData {
    title: string;
    slug: string;
    description: string;

    // New CMS Fields
    class: string;
    subject: string;
    medium: string;
    chapter_title: string;

    category: string;
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

export default function PostEditor({ subjects, taxonomy }: PostEditorProps) {
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const markdownEditorRef = useRef<MarkdownEditorRef>(null);

    // Dynamic Syllabus State
    const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
    const [loadingSyllabus, setLoadingSyllabus] = useState(false);

    const { control, register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<AdminFormData>({
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

    const isLanguageSubject = selectedSubject ? subjects[selectedSubject]?.isLanguageSubject : false;

    // Cascading Logic: Reset downstream fields
    useEffect(() => {
        setValue('class', '');
        setValue('subject', '');
        setValue('chapter_title', '');
        setSyllabus(null);
    }, [selectedCategory, setValue]);

    useEffect(() => {
        setValue('subject', '');
        setValue('chapter_title', '');
        setSyllabus(null);
    }, [selectedClass, setValue]);

    // Automatically clear medium if language subject is selected (Optional enhancement, but ensures clean state)
    useEffect(() => {
        if (isLanguageSubject) {
            setValue('medium', '');
        }
    }, [isLanguageSubject, setValue]);

    // Fetch Syllabus when Class/Subject changes
    useEffect(() => {
        if (selectedClass && selectedSubject) {
            setLoadingSyllabus(true);
            getSyllabus(selectedClass, selectedSubject, selectedCategory)
                .then(data => {
                    setSyllabus(data);
                    setValue('chapter_title', '');
                })
                .catch(err => {
                    console.error("Failed to load syllabus", err);
                    setSyllabus(null);
                })
                .finally(() => setLoadingSyllabus(false));
        } else {
            setSyllabus(null);
        }
    }, [selectedClass, selectedSubject, selectedCategory, setValue]);

    const onSubmit = async (data: AdminFormData) => {
        console.log("Form Submitted", data); // DEBUG
        setIsSubmitting(true);
        try {
            const result = await createPost(data);
            console.log("CreatePost Result:", result); // DEBUG
            if (result?.success) {
                setSnackbar({ open: true, message: result.message, severity: 'success' });
                reset();
            } else {
                setSnackbar({ open: true, message: result?.message || 'Error occurred', severity: 'error' });
            }
        } catch (e: any) {
            console.error("Submission Error:", e); // DEBUG
            setSnackbar({ open: true, message: e.message, severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onError = (errors: any) => {
        console.log("Validation Errors:", errors);
        setSnackbar({ open: true, message: "Please fill all required fields", severity: 'error' });
    };

    // Derived Options
    const categoryOptions = Object.keys(taxonomy || {});
    const classOptions = selectedCategory ? Object.keys(taxonomy[selectedCategory] || {}) : [];
    const subjectOptions = (selectedCategory && selectedClass) ? (taxonomy[selectedCategory][selectedClass] || []) : [];

    return (
        <Box sx={{ maxWidth: '1600px', mx: 'auto', pb: 4 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>

                    {/* Main Content (Editor) */}
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
                                        <Select label="Category" {...register('category', { required: true })} value={selectedCategory || ''} onChange={e => setValue('category', e.target.value)}>
                                            {categoryOptions.map(cat => (
                                                <MenuItem key={cat} value={cat}>{cat.replace(/-/g, ' ').toUpperCase()}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth size="small" disabled={!selectedCategory}>
                                        <InputLabel>Class</InputLabel>
                                        <Select label="Class" {...register('class', { required: true })} value={selectedClass || ''} onChange={e => setValue('class', e.target.value)}>
                                            {classOptions.map(cls => (
                                                <MenuItem key={cls} value={cls}>{cls.replace(/-/g, ' ').toUpperCase()}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth size="small" disabled={!selectedClass}>
                                        <InputLabel>Subject</InputLabel>
                                        <Select label="Subject" {...register('subject', { required: true })} value={selectedSubject || ''} onChange={e => setValue('subject', e.target.value)}>
                                            {subjectOptions.map(subSlug => {
                                                // Try to find display title from subjects prop, else proper case slug
                                                const subjectMeta = subjects[subSlug];
                                                const label = subjectMeta?.title || subSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                                return <MenuItem key={subSlug} value={subSlug}>{label}</MenuItem>;
                                            })}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth size="small" disabled={!!isLanguageSubject}>
                                        <InputLabel>Medium</InputLabel>
                                        <Select label="Medium" {...register('medium')} value={selectedMedium} onChange={e => setValue('medium', e.target.value)}>
                                            {MEDIUM_OPTIONS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth size="small" disabled={!syllabus || loadingSyllabus}>
                                        <InputLabel>{loadingSyllabus ? "Loading..." : "Chapter"}</InputLabel>
                                        <Controller
                                            name="chapter_title"
                                            control={control}
                                            render={({ field }) => (
                                                <Select label="Chapter" {...field}>
                                                    <MenuItem value=""><em>None</em></MenuItem>
                                                    {syllabus?.chapters?.map((ch, idx) => {
                                                        const val = ch.title || ch.title_as || '';
                                                        if (!val) return null; // Skip empty chapters

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

                        {/* Editor Area */}
                        <Card sx={{
                            flex: 1,
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(30, 30, 30, 0.9) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            minHeight: '600px',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            <ShortcodeToolbar onInsert={(code) => markdownEditorRef.current?.insertText(code)} />
                            <CardContent sx={{ flex: 1, p: 0, '& .w-md-editor': { minHeight: '500px' } }}>
                                <Controller
                                    name="content"
                                    control={control}
                                    render={({ field }) => (
                                        <MarkdownEditor ref={markdownEditorRef} value={field.value} onChange={field.onChange} />
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
                            position: 'sticky', top: 20
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <FileText size={20} color="#60a5fa" />
                                    <Typography variant="h6">Post Details</Typography>
                                </Box>
                                <div className="flex flex-col gap-4">
                                    <TextField label="Title" fullWidth {...register('title', { required: true })} error={!!errors.title} />
                                    <TextField label="Slug" fullWidth {...register('slug', { required: true })} error={!!errors.slug} />
                                    <TextField label="Description" fullWidth multiline rows={3} {...register('description')} />

                                    <TextField label="Reading Time (min)" type="number" fullWidth {...register('readingTime')} />
                                    <TextField label="Thumbnail URL" fullWidth {...register('thumbnail')} />

                                    <Controller name="keywords" control={control} render={({ field }) => (
                                        <KeywordsInput value={field.value} onChange={field.onChange} />
                                    )} />
                                </div>

                                <Divider sx={{ my: 3 }} />

                                <div className="flex gap-2">
                                    <Button
                                        fullWidth variant="contained"
                                        type="button"
                                        onClick={handleSubmit(d => onSubmit({ ...d, published: false }), onError)}
                                        disabled={isSubmitting}
                                        startIcon={<Save />}
                                    >
                                        Draft
                                    </Button>
                                    <Button
                                        fullWidth variant="contained" color="secondary"
                                        type="button"
                                        onClick={handleSubmit(d => onSubmit({ ...d, published: true }), onError)}
                                        disabled={isSubmitting}
                                        startIcon={<Send />}
                                    >
                                        Publish
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </form>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ zIndex: 9999 }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
