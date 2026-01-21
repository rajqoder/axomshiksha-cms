'use client';

import React from 'react';
import { CategoryInfo } from '@/actions/cms/metadata';
import { Card, CardContent, Grid, Typography, TextField } from '@mui/material';

interface CategoryCardProps {
    categoryKey: string;
    category: CategoryInfo;
    onCategoryChange: (key: string, field: keyof CategoryInfo, value: string) => void;
}

const CategoryCard = React.memo(({ categoryKey, category, onCategoryChange }: CategoryCardProps) => {
    return (
        <Card sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent>
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {categoryKey}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth size="small" label="Description"
                            value={category.description || ''}
                            onChange={(e) => onCategoryChange(categoryKey, 'description', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                            fullWidth size="small" label="Image Path"
                            value={category.image || ''}
                            onChange={(e) => onCategoryChange(categoryKey, 'image', e.target.value)}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;
