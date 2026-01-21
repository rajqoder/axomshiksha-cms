'use client';

import { useState } from 'react';
import { Chapter, Syllabus, updateSyllabus } from '@/actions/cms/syllabus';
import { Plus, Trash2, Save, BookOpen } from 'lucide-react';
import {
    Box, Button, TextField, Card, CardContent, Typography,
    Snackbar, Alert, IconButton, Divider, Grid, Chip
} from '@mui/material';

interface SyllabusEditorProps {
    initialSyllabus: Syllabus | null;
    classNameParam: string;
    subjectParam: string;
    groupParam: string;
}

export default function SyllabusEditor({ initialSyllabus, classNameParam, subjectParam, groupParam }: SyllabusEditorProps) {
    // Default structure if null
    const [syllabus, setSyllabus] = useState<Syllabus>(initialSyllabus || {
        title: '',
        title_as: '',
        chapters: []
    });

    // Status state replaced by Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [isSaving, setIsSaving] = useState(false);

    const handleChapterChange = (index: number, field: keyof Chapter, value: string) => {
        const newChapters = [...syllabus.chapters];
        newChapters[index] = { ...newChapters[index], [field]: value };
        setSyllabus({ ...syllabus, chapters: newChapters });
    };

    const addChapter = () => {
        setSyllabus({
            ...syllabus,
            chapters: [...syllabus.chapters, { title: '', title_as: '' }]
        });
    };

    const removeChapter = (index: number) => {
        const newChapters = syllabus.chapters.filter((_, i) => i !== index);
        setSyllabus({ ...syllabus, chapters: newChapters });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSyllabus(classNameParam, subjectParam, syllabus, groupParam);
            setSnackbar({ open: true, message: 'Saved successfully!', severity: 'success' });
        } catch (e: any) {
            setSnackbar({ open: true, message: `Error: ${e.message}`, severity: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box>
            <Card sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(30, 30, 30, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                mb: 4
            }}>
                <CardContent>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <BookOpen size={24} className="text-blue-500" />
                            <Typography variant="h6" fontWeight={600}>
                                Edit Syllabus: {classNameParam} / {subjectParam}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Save />}
                            onClick={handleSave}
                            disabled={!classNameParam || !subjectParam || isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </Box>

                    {/* Main Metadata */}
                    <Box sx={{ mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Subject Title (English)"
                            value={syllabus.title}
                            onChange={(e) => setSyllabus({ ...syllabus, title: e.target.value })}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Subject Title (Assamese)"
                            value={syllabus.title_as || ''}
                            onChange={(e) => setSyllabus({ ...syllabus, title_as: e.target.value })}
                            variant="outlined"
                        />
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Chapters List */}
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Chapters
                        </Typography>
                        <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            startIcon={<Plus />}
                            onClick={addChapter}
                        >
                            Add Chapter
                        </Button>
                    </Box>

                    {syllabus.chapters.length === 0 && (
                        <Alert severity="info" variant="outlined" sx={{ opacity: 0.7 }}>
                            No chapters defined. Click "Add Chapter" to begin.
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {syllabus.chapters.map((chapter, index) => (
                            <Card key={index} variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                <CardContent sx={{ p: '16px !important', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                    <Chip label={`#${index + 1}`} size="small" variant="outlined" sx={{ mt: 1, minWidth: 40 }} />

                                    <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Chapter Title (English)"
                                            value={chapter.title}
                                            onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                                        />
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Chapter Title (Assamese)"
                                            value={chapter.title_as || ''}
                                            onChange={(e) => handleChapterChange(index, 'title_as', e.target.value)}
                                        />
                                    </Box>

                                    <IconButton
                                        color="error"
                                        onClick={() => removeChapter(index)}
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                    >
                                        <Trash2 size={20} />
                                    </IconButton>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            {/* Notification */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
