'use client';

import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Box, Chip, OutlinedInput } from '@mui/material';

interface AddSubjectDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (key: string, title: string, classes: string[], description: string, gradient: string) => void;
    classOptions: string[];
}

export default function AddSubjectDialog({ open, onClose, onAdd, classOptions }: AddSubjectDialogProps) {
    const [key, setKey] = useState('');
    const [title, setTitle] = useState('');
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [gradient, setGradient] = useState('');

    const handleAdd = () => {
        if (key && title && selectedClasses.length > 0) {
            onAdd(key, title, selectedClasses, description, gradient);
            setKey('');
            setTitle('');
            setSelectedClasses([]);
            setDescription('');
            setGradient('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    <TextField
                        autoFocus
                        label="Subject Slug (e.g., mathematics)"
                        fullWidth
                        value={key}
                        onChange={(e) => setKey(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        helperText="Use lowercase and hyphens (unique ID)"
                    />
                    <TextField
                        label="Display Title"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Associated Classes</InputLabel>
                        <Select
                            multiple
                            value={selectedClasses}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedClasses(typeof value === 'string' ? value.split(',') : value);
                            }}
                            input={<OutlinedInput label="Associated Classes" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} size="small" />
                                    ))}
                                </Box>
                            )}
                        >
                            {classOptions.map((cls) => (
                                <MenuItem key={cls} value={cls}>
                                    {cls}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Description"
                        fullWidth
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        label="Gradient Class"
                        fullWidth
                        value={gradient}
                        onChange={(e) => setGradient(e.target.value)}
                        placeholder="from-blue-500 to-cyan-500"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleAdd} variant="contained" disabled={!key || !title || selectedClasses.length === 0}>Add Subject</Button>
            </DialogActions>
        </Dialog>
    );
}
