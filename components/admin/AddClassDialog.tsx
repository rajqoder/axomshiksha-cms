'use client';

import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

interface AddClassDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (key: string, category: string, description: string, image: string) => void;
    categoryOptions: string[];
}

export default function AddClassDialog({ open, onClose, onAdd, categoryOptions }: AddClassDialogProps) {
    const [key, setKey] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');

    const handleAdd = () => {
        if (key && category) {
            onAdd(key, category, description, image);
            setKey('');
            setCategory('');
            setDescription('');
            setImage('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    <TextField
                        autoFocus
                        label="Class Slug (e.g., class-11)"
                        fullWidth
                        value={key}
                        onChange={(e) => setKey(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        helperText="Use lowercase and hyphens (unique ID)"
                    />
                    <FormControl fullWidth>
                        <InputLabel>Parent Category</InputLabel>
                        <Select
                            label="Parent Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categoryOptions.map(cat => (
                                <MenuItem key={cat} value={cat}>{cat.replace(/-/g, ' ').toUpperCase()}</MenuItem>
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
                        label="Image Path (Optional)"
                        fullWidth
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleAdd} variant="contained" disabled={!key || !category}>Add Class</Button>
            </DialogActions>
        </Dialog>
    );
}
