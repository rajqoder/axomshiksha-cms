'use client';

import React from 'react';
import { Subject } from '@/actions/cms/metadata';
import { Card, CardContent, Grid, Typography, TextField, Divider, Box, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput } from '@mui/material';

interface SubjectCardProps {
    subjectKey: string;
    subject: Subject;
    allClassOptions: string[];
    onSubjectChange: (key: string, field: keyof Subject, value: any) => void;
    // onClassToggle is no longer used individually, but we might keep it or remove it from props. 
    // The previous implementation passed it, so I should probably update the interface.
    // However, to avoid changing the parent just for the callback signature if I can reuse onSubjectChange, I'll remove it if possible.
    // But Render uses it? No, I replaced the usage.
}

const SubjectCard = React.memo(({ subjectKey, subject, allClassOptions, onSubjectChange }: Omit<SubjectCardProps, 'onClassToggle'>) => {
    return (
        <Card sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'monospace' }}>
                            {subjectKey}
                        </Typography>
                        <TextField
                            fullWidth size="small" label="Display Title"
                            value={subject.title || ''}
                            onChange={(e) => onSubjectChange(subjectKey, 'title', e.target.value)}
                        />
                        <TextField
                            fullWidth size="small" label="Gradient Class"
                            value={subject.gradient || ''}
                            onChange={(e) => onSubjectChange(subjectKey, 'gradient', e.target.value)}
                            sx={{ mt: 2 }}
                            placeholder="from-x-500 to-y-500"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 9 }}>
                        <TextField
                            fullWidth size="small" label="Description"
                            value={subject.description || ''}
                            onChange={(e) => onSubjectChange(subjectKey, 'description', e.target.value)}
                            sx={{ mb: 3 }}
                        />
                        <Divider textAlign="left" sx={{ mb: 2 }}><Typography variant="caption">AVAILABLE CLASSES</Typography></Divider>
                        <FormControl fullWidth size="small">
                            <InputLabel id={`classes-label-${subjectKey}`}>Associated Classes</InputLabel>
                            <Select
                                labelId={`classes-label-${subjectKey}`}
                                multiple
                                value={subject.classes || []}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Handle string[] or string (though multiple usually returns string[])
                                    const newClasses = typeof value === 'string' ? value.split(',') : value;
                                    onSubjectChange(subjectKey, 'classes', newClasses);
                                }}
                                input={<OutlinedInput label="Associated Classes" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 250,
                                        },
                                    },
                                }}
                            >
                                {allClassOptions.map((cls) => (
                                    <MenuItem key={cls} value={cls}>
                                        {cls}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});

SubjectCard.displayName = 'SubjectCard';

export default SubjectCard;
