'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Taxonomy } from '@/actions/cms/metadata';
import { Box, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Button, Typography } from '@mui/material';
import { Search } from 'lucide-react';

interface SyllabusSelectorProps {
    taxonomy: Taxonomy;
}

export default function SyllabusSelector({ taxonomy }: SyllabusSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial extraction from URL or infer from taxonomy? 
    // Since URL only has class/subject, we might need to find the category for the selected class to pre-fill it.
    const initialClass = searchParams.get('class') || '';
    const initialSubject = searchParams.get('subject') || '';

    // Find category for initial class
    const findCategoryForClass = (classSlug: string) => {
        if (!classSlug) return '';
        for (const [cat, classes] of Object.entries(taxonomy)) {
            if (classes[classSlug]) return cat;
        }
        return '';
    };

    const [category, setCategory] = useState(findCategoryForClass(initialClass));
    const [selectedClass, setSelectedClass] = useState(initialClass);
    const [subject, setSubject] = useState(initialSubject);

    // Update state if URL changes externally (e.g. back button)
    useEffect(() => {
        const cls = searchParams.get('class') || '';
        const sub = searchParams.get('subject') || '';
        if (cls !== selectedClass) {
            setSelectedClass(cls);
            setCategory(findCategoryForClass(cls));
        }
        if (sub !== subject) setSubject(sub);
    }, [searchParams]);

    // Derived Options
    const categoryOptions = Object.keys(taxonomy);
    const classOptions = useMemo(() => {
        return category ? Object.keys(taxonomy[category] || {}) : [];
    }, [category, taxonomy]);

    const subjectOptions = useMemo(() => {
        return (category && selectedClass) ? (taxonomy[category][selectedClass] || []) : [];
    }, [category, selectedClass, taxonomy]);

    // Handlers
    const handleCategoryChange = (val: string) => {
        setCategory(val);
        setSelectedClass('');
        setSubject('');
    };

    const handleClassChange = (val: string) => {
        setSelectedClass(val);
        setSubject('');
    };

    const handleLoad = () => {
        if (selectedClass && subject) {
            router.push(`/admin/syllabus?class=${selectedClass}&subject=${subject}`);
        }
    };

    return (
        <Card sx={{
            mb: 4,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(30, 30, 30, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Search size={20} className="text-blue-400" />
                    Select Context
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            label="Category"
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            {categoryOptions.map(cat => (
                                <MenuItem key={cat} value={cat}>{cat.replace(/-/g, ' ').toUpperCase()}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled={!category}>
                        <InputLabel>Class</InputLabel>
                        <Select
                            value={selectedClass}
                            label="Class"
                            onChange={(e) => handleClassChange(e.target.value)}
                        >
                            {classOptions.map(cls => (
                                <MenuItem key={cls} value={cls}>{cls.replace(/-/g, ' ').toUpperCase()}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth size="small" disabled={!selectedClass}>
                            <InputLabel>Subject</InputLabel>
                            <Select
                                value={subject}
                                label="Subject"
                                onChange={(e) => setSubject(e.target.value)}
                            >
                                {subjectOptions.map(sub => (
                                    <MenuItem key={sub} value={sub}>{sub.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            onClick={handleLoad}
                            disabled={!selectedClass || !subject}
                            sx={{ minWidth: '100px' }}
                        >
                            Load
                        </Button>
                    </Box>
                </div>
            </CardContent>
        </Card>
    );
}
