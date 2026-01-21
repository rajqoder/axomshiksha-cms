'use client';

import React from 'react';
import { CategoryInfo } from '@/actions/cms/metadata';
import { Card, CardContent, Grid, Typography, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

interface ClassCardProps {
    classKey: string;
    subCat: CategoryInfo;
    categoryOptions: string[];
    onSubCategoryChange: (key: string, field: keyof CategoryInfo, value: string) => void;
}

const ClassCard = React.memo(({ classKey, subCat, categoryOptions, onSubCategoryChange }: ClassCardProps) => {
    return (
        <Card sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent>
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {classKey}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Parent Category</InputLabel>
                            <Select
                                label="Parent Category"
                                value={subCat.category || ''}
                                onChange={(e) => onSubCategoryChange(classKey, 'category', e.target.value)}
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
                            onChange={(e) => onSubCategoryChange(classKey, 'image', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                            fullWidth size="small" label="Description"
                            value={subCat.description || ''}
                            onChange={(e) => onSubCategoryChange(classKey, 'description', e.target.value)}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});

ClassCard.displayName = 'ClassCard';

export default ClassCard;
