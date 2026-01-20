'use client';

import { useState, useMemo } from 'react';
import { Subject, CategoriesData, SubCategoriesData, updateSubjects, updateCategories, updateSubCategories, CategoryInfo } from '@/actions/cms/metadata';
import { Save, Filter, Layers, BookOpen, FolderOpen } from 'lucide-react';
import {
    Box, Tabs, Tab, TextField, Select, MenuItem, Button, Card, CardContent,
    Typography, FormControl, InputLabel, FormControlLabel, Checkbox,
    Grid, Snackbar, Alert, Chip, Divider,
} from '@mui/material';

interface MetadataManagerProps {
    initialSubjects: Record<string, Subject>;
    initialCategories: CategoriesData;
    initialSubCategories: SubCategoriesData;
}

type TabType = 'subjects' | 'classes' | 'categories';

export default function MetadataForms({ initialSubjects, initialCategories, initialSubCategories }: MetadataManagerProps) {
    const [subCategoriesObj, setSubCategoriesObj] = useState(initialSubCategories);
    const [subjectsObj, setSubjectsObj] = useState(initialSubjects);
    const [categoriesObj, setCategoriesObj] = useState(initialCategories);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [activeTab, setActiveTab] = useState<TabType>('subjects');

    // --- Filters ---
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterClass, setFilterClass] = useState<string>('');

    // --- Derived Data for Dropdowns ---
    const categoryOptions = useMemo(() => Object.keys(categoriesObj), [categoriesObj]);
    const allClassOptions = useMemo(() => Object.keys(subCategoriesObj).sort(), [subCategoriesObj]);

    // Classes available for the selected filter category
    const filteredClassOptions = useMemo(() => {
        if (!filterCategory) return allClassOptions;
        return Object.entries(subCategoriesObj)
            .filter(([_, sub]) => sub.category === filterCategory)
            .map(([key]) => key)
            .sort();
    }, [filterCategory, subCategoriesObj, allClassOptions]);

    // --- Filtered Lists for Rendering ---

    // 1. Filtered Classes
    const filteredClasses = useMemo(() => {
        let entries = Object.entries(subCategoriesObj);
        if (filterCategory) {
            entries = entries.filter(([_, sub]) => sub.category === filterCategory);
        }
        return entries;
    }, [subCategoriesObj, filterCategory]);

    // 2. Filtered Subjects
    const filteredSubjects = useMemo(() => {
        let entries = Object.entries(subjectsObj);

        // If Class is selected, show subjects valid for that class
        if (filterClass) {
            entries = entries.filter(([_, sub]) => sub.classes?.includes(filterClass));
        }
        // If only Category is selected, show subjects valid for ANY class in that category
        else if (filterCategory) {
            const classesInCategory = new Set(filteredClassOptions);
            entries = entries.filter(([_, sub]) =>
                sub.classes?.some(cls => classesInCategory.has(cls))
            );
        }

        return entries;
    }, [subjectsObj, filterClass, filterCategory, filteredClassOptions]);


    // --- Common Save Handler ---
    const handleSave = async (type: TabType) => {
        setSnackbar({ open: true, message: `Saving ${type}...`, severity: 'success' });
        try {
            if (type === 'subjects') await updateSubjects(subjectsObj);
            if (type === 'classes') await updateSubCategories(subCategoriesObj);
            if (type === 'categories') await updateCategories(categoriesObj);
            setSnackbar({ open: true, message: `${type} saved successfully!`, severity: 'success' });
        } catch (e: any) {
            setSnackbar({ open: true, message: `Error: ${e.message}`, severity: 'error' });
        }
    };

    // --- Handlers ---
    const handleSubjectChange = (key: string, field: keyof Subject, value: any) => {
        setSubjectsObj(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const handleClassToggle = (subjectKey: string, classSlug: string) => {
        const currentClasses = subjectsObj[subjectKey].classes || [];
        const newClasses = currentClasses.includes(classSlug)
            ? currentClasses.filter(c => c !== classSlug)
            : [...currentClasses, classSlug];

        handleSubjectChange(subjectKey, 'classes', newClasses);
    };

    const handleSubCategoryChange = (key: string, field: keyof CategoryInfo, value: string) => {
        setSubCategoriesObj(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const handleCategoryChange = (key: string, field: keyof CategoryInfo, value: string) => {
        setCategoriesObj(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    // Reset Class filter when Category changes
    const handleFilterCategoryChange = (cat: string) => {
        setFilterCategory(cat);
        setFilterClass('');
    };

    const tabLabel = (type: string, count: number) => (
        <div className="flex items-center gap-2">
            <span className="capitalize">{type}</span>
            <Chip label={count} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
        </div>
    );

    return (
        <Box sx={{ pb: 8 }}>

            {/* Top Bar: Tabs & Actions */}
            <Card sx={{
                mb: 4,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(30, 30, 30, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <CardContent sx={{ pb: 0 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                            <Tab label={tabLabel('subjects', filteredSubjects.length)} value="subjects" icon={<BookOpen size={18} />} iconPosition="start" />
                            <Tab label={tabLabel('classes', filteredClasses.length)} value="classes" icon={<Layers size={18} />} iconPosition="start" />
                            <Tab label={tabLabel('categories', Object.keys(categoriesObj).length)} value="categories" icon={<FolderOpen size={18} />} iconPosition="start" />
                        </Tabs>
                    </Box>

                    {/* Filter Bar (Only for Subjects and Classes) */}
                    {activeTab !== 'categories' && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <Filter size={18} />
                                <Typography variant="body2" fontWeight={500}>Filter Context:</Typography>
                            </Box>

                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    label="Category"
                                    value={filterCategory}
                                    onChange={(e) => handleFilterCategoryChange(e.target.value)}
                                >
                                    <MenuItem value=""><em>All Categories</em></MenuItem>
                                    {categoryOptions.map(cat => (
                                        <MenuItem key={cat} value={cat}>{cat.replace(/-/g, ' ').toUpperCase()}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {activeTab === 'subjects' && (
                                <FormControl size="small" sx={{ minWidth: 200 }} disabled={!filterCategory}>
                                    <InputLabel>Class</InputLabel>
                                    <Select
                                        label="Class"
                                        value={filterClass}
                                        onChange={(e) => setFilterClass(e.target.value)}
                                    >
                                        <MenuItem value=""><em>{filterCategory ? 'All Classes' : 'Select Category'}</em></MenuItem>
                                        {filteredClassOptions.map(cls => (
                                            <MenuItem key={cls} value={cls}>{cls.replace(/-/g, ' ').toUpperCase()}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            {(filterCategory || filterClass) && (
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => { setFilterCategory(''); setFilterClass(''); }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Main Action Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    onClick={() => handleSave(activeTab)}
                >
                    Save Changes
                </Button>
            </Box>

            {/* CONTENT AREA */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* --- SUBJECTS TAB --- */}
                {activeTab === 'subjects' && (
                    filteredSubjects.length > 0 ? (
                        filteredSubjects.map(([key, subject]) => (
                            <Card key={key} sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                                <CardContent>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'monospace' }}>
                                                {key}
                                            </Typography>
                                            <TextField
                                                fullWidth size="small" label="Display Title"
                                                value={subject.title || ''}
                                                onChange={(e) => handleSubjectChange(key, 'title', e.target.value)}
                                            />
                                            <TextField
                                                fullWidth size="small" label="Gradient Class"
                                                value={subject.gradient || ''}
                                                onChange={(e) => handleSubjectChange(key, 'gradient', e.target.value)}
                                                sx={{ mt: 2 }}
                                                placeholder="from-x-500 to-y-500"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 9 }}>
                                            <TextField
                                                fullWidth size="small" label="Description"
                                                value={subject.description || ''}
                                                onChange={(e) => handleSubjectChange(key, 'description', e.target.value)}
                                                sx={{ mb: 3 }}
                                            />
                                            <Divider textAlign="left" sx={{ mb: 2 }}><Typography variant="caption">AVAILABLE CLASSES</Typography></Divider>
                                            <Box sx={{ maxHeight: 200, overflowY: 'auto', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                                                <Grid container spacing={1}>
                                                    {allClassOptions.map(cls => (
                                                        <Grid key={cls} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        size="small"
                                                                        checked={subject.classes?.includes(cls) || false}
                                                                        onChange={() => handleClassToggle(key, cls)}
                                                                    />
                                                                }
                                                                label={<Typography variant="caption">{cls}</Typography>}
                                                            />
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Alert severity="info" variant="outlined">No subjects found for the current filters.</Alert>
                    )
                )}

                {/* --- CLASSES TAB --- */}
                {activeTab === 'classes' && (
                    filteredClasses.length > 0 ? (
                        filteredClasses.map(([key, subCat]) => (
                            <Card key={key} sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                                <CardContent>
                                    <Grid container spacing={3} alignItems="center">
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                                                {key}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Parent Category</InputLabel>
                                                <Select
                                                    label="Parent Category"
                                                    value={subCat.category || ''}
                                                    onChange={(e) => handleSubCategoryChange(key, 'category', e.target.value)}
                                                >
                                                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                                                    {categoryOptions.map(cat => (
                                                        <MenuItem key={cat} value={cat}>{cat.replace(/-/g, ' ').toUpperCase()}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <TextField
                                                fullWidth size="small" label="Image Path"
                                                value={subCat.image || ''}
                                                onChange={(e) => handleSubCategoryChange(key, 'image', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <TextField
                                                fullWidth size="small" label="Description"
                                                value={subCat.description || ''}
                                                onChange={(e) => handleSubCategoryChange(key, 'description', e.target.value)}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Alert severity="info" variant="outlined">No classes found for the current filters.</Alert>
                    )
                )}

                {/* --- CATEGORIES TAB --- */}
                {activeTab === 'categories' && (
                    Object.entries(categoriesObj).map(([key, cat]) => (
                        <Card key={key} sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                            <CardContent>
                                <Grid container spacing={3} alignItems="center">
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                                            {key}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            fullWidth size="small" label="Description"
                                            value={cat.description || ''}
                                            onChange={(e) => handleCategoryChange(key, 'description', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <TextField
                                            fullWidth size="small" label="Image Path"
                                            value={cat.image || ''}
                                            onChange={(e) => handleCategoryChange(key, 'image', e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>

            {/* Notification */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
