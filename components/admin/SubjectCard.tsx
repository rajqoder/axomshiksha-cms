'use client';

import React from 'react';
import { Subject } from '@/actions/cms/metadata';
import { Card, CardContent, Grid, Typography, TextField, Divider, Box, FormControlLabel, Checkbox } from '@mui/material';

interface SubjectCardProps {
    subjectKey: string;
    subject: Subject;
    allClassOptions: string[];
    onSubjectChange: (key: string, field: keyof Subject, value: any) => void;
    onClassToggle: (subjectKey: string, classSlug: string) => void;
}

const SubjectCard = React.memo(({ subjectKey, subject, allClassOptions, onSubjectChange, onClassToggle }: SubjectCardProps) => {
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
                        <Box sx={{ maxHeight: 200, overflowY: 'auto', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Grid container spacing={1}>
                                {allClassOptions.map(cls => (
                                    <Grid key={cls} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={subject.classes?.includes(cls) || false}
                                                    onChange={() => onClassToggle(subjectKey, cls)}
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
    );
});

SubjectCard.displayName = 'SubjectCard';

export default SubjectCard;
