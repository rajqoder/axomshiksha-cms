'use client';

import { useState, useMemo, useCallback } from 'react';
import { Subject, CategoriesData, SubCategoriesData, updateSubjects, updateCategories, updateSubCategories, CategoryInfo } from '@/actions/cms/metadata';
import { Save, Filter, Layers, BookOpen, FolderOpen, Plus } from 'lucide-react';
import {
    Box, Tabs, Tab, Select, MenuItem, Button, Card, CardContent,
    Typography, FormControl, InputLabel, Snackbar, Alert, Chip
} from '@mui/material';
import SubjectCard from './SubjectCard';
import ClassCard from './ClassCard';
import CategoryCard from './CategoryCard';
import AddClassDialog from './AddClassDialog';
import AddSubjectDialog from './AddSubjectDialog';

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

    // Dialog States
    const [isAddClassOpen, setIsAddClassOpen] = useState(false);
    const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

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

    // --- Handlers (Memoized) ---
    const handleSubjectChange = useCallback((key: string, field: keyof Subject, value: any) => {
        setSubjectsObj(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    }, []);

    const handleClassToggle = useCallback((subjectKey: string, classSlug: string) => {
        setSubjectsObj(prev => {
            const currentClasses = prev[subjectKey].classes || [];
            const newClasses = currentClasses.includes(classSlug)
                ? currentClasses.filter(c => c !== classSlug)
                : [...currentClasses, classSlug];
            return {
                ...prev,
                [subjectKey]: { ...prev[subjectKey], classes: newClasses }
            };
        });
    }, []);

    const handleSubCategoryChange = useCallback((key: string, field: keyof CategoryInfo, value: string) => {
        setSubCategoriesObj(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    }, []);

    const handleCategoryChange = useCallback((key: string, field: keyof CategoryInfo, value: string) => {
        setCategoriesObj(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    }, []);

    // --- Add Handlers ---
    const handleAddClass = (key: string, category: string, description: string, image: string) => {
        if (subCategoriesObj[key]) {
            setSnackbar({ open: true, message: 'Class key already exists!', severity: 'error' });
            return;
        }
        setSubCategoriesObj(prev => ({
            ...prev,
            [key]: { description, image, category, type: 'class' } // Default type
        }));
        setSnackbar({ open: true, message: 'Class added! Remember to save changes.', severity: 'success' });
    };

    const handleAddSubject = (key: string, title: string, classes: string[], description: string, gradient: string) => {
        if (subjectsObj[key]) {
            setSnackbar({ open: true, message: 'Subject key already exists!', severity: 'error' });
            return;
        }
        setSubjectsObj(prev => ({
            ...prev,
            [key]: { title, classes, description, gradient }
        }));
        setSnackbar({ open: true, message: 'Subject added! Remember to save changes.', severity: 'success' });
    };

    // Reset Class filter when Category changes
    const handleFilterCategoryChange = (cat: string) => {
        setFilterCategory(cat);
        setFilterClass('');
    };

    // --- Pagination Logic ---
    const ITEMS_PER_PAGE = 10;
    const [page, setPage] = useState(1);

    // Reset page when tab or filter changes
    useMemo(() => {
        setPage(1);
    }, [activeTab, filterCategory, filterClass]);

    const displayedSubjects = useMemo(() => filteredSubjects.slice(0, page * ITEMS_PER_PAGE), [filteredSubjects, page]);
    const displayedClasses = useMemo(() => filteredClasses.slice(0, page * ITEMS_PER_PAGE), [filteredClasses, page]);

    const tabLabel = (label: string, count: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {label.charAt(0).toUpperCase() + label.slice(1)}
            <Chip
                label={count}
                size="small"
                sx={{ height: 20, minWidth: 20, px: 0.5, fontSize: '0.7rem', opacity: 0.8 }}
            />
        </Box>
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
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                            <Tab label={tabLabel('subjects', filteredSubjects.length)} value="subjects" icon={<BookOpen size={18} />} iconPosition="start" />
                            <Tab label={tabLabel('classes', filteredClasses.length)} value="classes" icon={<Layers size={18} />} iconPosition="start" />
                            <Tab label={tabLabel('categories', Object.keys(categoriesObj).length)} value="categories" icon={<FolderOpen size={18} />} iconPosition="start" />
                        </Tabs>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {activeTab === 'subjects' && (
                                <Button
                                    variant="outlined"
                                    startIcon={<Plus />}
                                    onClick={() => setIsAddSubjectOpen(true)}
                                    sx={{ mb: 1 }}
                                >
                                    Add Subject
                                </Button>
                            )}
                            {activeTab === 'classes' && (
                                <Button
                                    variant="outlined"
                                    startIcon={<Plus />}
                                    onClick={() => setIsAddClassOpen(true)}
                                    sx={{ mb: 1 }}
                                >
                                    Add Class
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Save />}
                                onClick={() => handleSave(activeTab)}
                                sx={{ mb: 1, mr: 1 }}
                            >
                                Save Changes
                            </Button>
                        </Box>
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

            {/* CONTENT AREA */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* --- SUBJECTS TAB --- */}
                {activeTab === 'subjects' && (
                    filteredSubjects.length > 0 ? (
                        <>
                            {displayedSubjects.map(([key, subject]) => (
                                <SubjectCard
                                    key={key}
                                    subjectKey={key}
                                    subject={subject}
                                    allClassOptions={allClassOptions}
                                    onSubjectChange={handleSubjectChange}
                                />
                            ))}
                            {displayedSubjects.length < filteredSubjects.length && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <Button onClick={() => setPage(p => p + 1)} variant="outlined">Load More Subjects</Button>
                                </Box>
                            )}
                        </>
                    ) : (
                        <Alert severity="info" variant="outlined">No subjects found for the current filters.</Alert>
                    )
                )}

                {/* --- CLASSES TAB --- */}
                {activeTab === 'classes' && (
                    filteredClasses.length > 0 ? (
                        <>
                            {displayedClasses.map(([key, subCat]) => (
                                <ClassCard
                                    key={key}
                                    classKey={key}
                                    subCat={subCat}
                                    categoryOptions={categoryOptions}
                                    onSubCategoryChange={handleSubCategoryChange}
                                />
                            ))}
                            {displayedClasses.length < filteredClasses.length && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <Button onClick={() => setPage(p => p + 1)} variant="outlined">Load More Classes</Button>
                                </Box>
                            )}
                        </>
                    ) : (
                        <Alert severity="info" variant="outlined">No classes found for the current filters.</Alert>
                    )
                )}

                {/* --- CATEGORIES TAB --- */}
                {activeTab === 'categories' && (
                    Object.entries(categoriesObj).map(([key, cat]) => (
                        <CategoryCard
                            key={key}
                            categoryKey={key}
                            category={cat}
                            onCategoryChange={handleCategoryChange}
                        />
                    ))
                )}
            </Box>

            {/* Dialogs */}
            <AddClassDialog
                open={isAddClassOpen}
                onClose={() => setIsAddClassOpen(false)}
                onAdd={handleAddClass}
                categoryOptions={categoryOptions}
            />
            <AddSubjectDialog
                open={isAddSubjectOpen}
                onClose={() => setIsAddSubjectOpen(false)}
                onAdd={handleAddSubject}
                classOptions={allClassOptions}
            />

            {/* Notification */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
