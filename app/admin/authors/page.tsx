'use client';

import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Avatar,
    Stack,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    TextField,
    MenuItem,
    FormControlLabel,
    Switch
} from '@mui/material';
import { getAllAuthors, saveAuthor, deleteAuthor, Author } from '../../../actions/manageAuthors';
import { Edit, Trash, Plus, CheckCircle, XCircle } from 'lucide-react';

export default function AuthorsPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(false);
    const [authorDialogOpen, setAuthorDialogOpen] = useState(false);
    const [deleteAuthorDialogOpen, setDeleteAuthorDialogOpen] = useState(false);

    const [currentAuthor, setCurrentAuthor] = useState<Author | null>(null);
    const [authorToDelete, setAuthorToDelete] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAuthors = async () => {
        setLoading(true);
        try {
            const res = await getAllAuthors();
            if (res.success && res.data) {
                setAuthors(res.data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthors();
    }, []);

    const handleEditAuthor = (author: Author) => {
        setCurrentAuthor(author);
        setAuthorDialogOpen(true);
    };

    const handleNewAuthor = () => {
        setCurrentAuthor({
            handle: '',
            name: '',
            email: '',
            role: 'author',
            bio: '',
        });
        setAuthorDialogOpen(true);
    };

    const handleSaveAuthor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentAuthor) return;

        setIsSubmitting(true);
        try {
            const res = await saveAuthor(currentAuthor);
            if (res.success) {
                setAuthorDialogOpen(false);
                fetchAuthors();
                alert(res.message);
            } else {
                alert(res.message || 'Failed to save author');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (handle: string) => {
        setAuthorToDelete(handle);
        setDeleteAuthorDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!authorToDelete) return;
        try {
            const res = await deleteAuthor(authorToDelete);
            if (res.success) {
                fetchAuthors();
                alert(res.message);
            } else {
                alert(res.message);
            }
        } finally {
            setDeleteAuthorDialogOpen(false);
            setAuthorToDelete(null);
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'avatar', headerName: 'Avatar', width: 80, sortable: false,
            renderCell: (params) => <Avatar src={params.value} alt={params.row.name}>{params.row.name ? params.row.name[0] : '?'}</Avatar>
        },
        { field: 'handle', headerName: 'Handle', width: 150 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'email', headerName: 'Email', width: 250 },
        {
            field: 'role', headerName: 'Role', width: 120,
            renderCell: (params) => <Chip label={params.value} color={params.value === 'admin' ? 'primary' : 'default'} size="small" />
        },
        {
            field: 'status', headerName: 'Status', width: 150,
            renderCell: (params) => {
                const author = params.row as Author;
                if (author.role === 'admin') return <Chip label="Verified" color="success" size="small" icon={<CheckCircle size={14} />} />;
                return author.isVerifiedByAdmin
                    ? <Chip label="Verified" color="success" size="small" icon={<CheckCircle size={14} />} />
                    : <Chip label="Unverified" color="warning" size="small" icon={<XCircle size={14} />} />;
            }
        },
        {
            field: 'actions', headerName: 'Actions', width: 100, sortable: false, filterable: false, align: 'center', headerAlign: 'center',
            renderCell: (params) => (
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ height: '100%', width: '100%' }}>
                    <IconButton size="small" onClick={() => handleEditAuthor(params.row as Author)} title="Edit"><Edit size={16} /></IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDeleteClick(params.row.handle)} title="Delete"><Trash size={16} /></IconButton>
                </Stack>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="text-3xl font-bold">Authors</h1>
                <Button variant="contained" startIcon={<Plus size={18} />} onClick={handleNewAuthor}>
                    Add Author
                </Button>
            </Box>

            <Card>
                <CardContent>
                    <div style={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={authors.map((a) => ({ ...a, id: a.handle }))}
                            columns={columns}
                            loading={loading}
                            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                            pageSizeOptions={[10, 20]}
                            disableRowSelectionOnClick
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Author Delete Dialog */}
            <Dialog open={deleteAuthorDialogOpen} onClose={() => setDeleteAuthorDialogOpen(false)}>
                <DialogTitle>Confirm Delete Author</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this author? This might affect authorship attribution on posts.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteAuthorDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Author Edit/New Dialog */}
            <Dialog open={authorDialogOpen} onClose={() => setAuthorDialogOpen(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSaveAuthor}>
                    <DialogTitle>{currentAuthor?.handle ? 'Edit Author' : 'New Author'}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField
                                label="Handle (Unique ID)"
                                fullWidth
                                disabled={!!currentAuthor?.handle && authors.some(a => a.handle === currentAuthor.handle && a.name !== '')}
                                value={currentAuthor?.handle || ''}
                                onChange={(e) => setCurrentAuthor(prev => prev ? ({ ...prev, handle: e.target.value }) : null)}
                                required
                            />
                            <TextField
                                label="Name" fullWidth value={currentAuthor?.name || ''}
                                onChange={(e) => setCurrentAuthor(prev => prev ? ({ ...prev, name: e.target.value }) : null)} required
                            />
                            <TextField
                                label="Email" type="email" fullWidth value={currentAuthor?.email || ''}
                                onChange={(e) => setCurrentAuthor(prev => prev ? ({ ...prev, email: e.target.value }) : null)} required
                            />
                            <TextField
                                label="Role" select fullWidth value={currentAuthor?.role || 'author'}
                                onChange={(e) => setCurrentAuthor(prev => prev ? ({ ...prev, role: e.target.value as any }) : null)}
                            >
                                <MenuItem value="author">Author</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </TextField>
                            <TextField
                                label="Bio" multiline rows={3} fullWidth value={currentAuthor?.bio || ''}
                                onChange={(e) => setCurrentAuthor(prev => prev ? ({ ...prev, bio: e.target.value }) : null)}
                            />

                            <TextField
                                label="Avatar URL" fullWidth value={currentAuthor?.avatar || ''}
                                onChange={(e) => setCurrentAuthor(prev => prev ? ({ ...prev, avatar: e.target.value }) : null)}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={!!currentAuthor?.isVerifiedByAdmin}
                                        onChange={(e) => setCurrentAuthor(prev => prev ? ({ ...prev, isVerifiedByAdmin: e.target.checked }) : null)}
                                        disabled={currentAuthor?.role === 'admin'}
                                    />
                                }
                                label="Verified by Admin"
                            />

                            <Typography variant="subtitle1" sx={{ mt: 1 }}>Social Links</Typography>
                            {currentAuthor?.social_links?.map((link, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        label="Platform" size="small" sx={{ width: '150px' }}
                                        value={link.platform}
                                        onChange={(e) => {
                                            const newLinks = [...(currentAuthor.social_links || [])];
                                            newLinks[index] = { ...newLinks[index], platform: e.target.value };
                                            setCurrentAuthor(prev => prev ? ({ ...prev, social_links: newLinks }) : null);
                                        }}
                                    />
                                    <TextField
                                        label="URL" size="small" fullWidth
                                        value={link.url}
                                        onChange={(e) => {
                                            const newLinks = [...(currentAuthor.social_links || [])];
                                            newLinks[index] = { ...newLinks[index], url: e.target.value };
                                            setCurrentAuthor(prev => prev ? ({ ...prev, social_links: newLinks }) : null);
                                        }}
                                    />
                                    <IconButton color="error" onClick={() => {
                                        const newLinks = currentAuthor.social_links?.filter((_, i) => i !== index);
                                        setCurrentAuthor(prev => prev ? ({ ...prev, social_links: newLinks }) : null);
                                    }}>
                                        <Trash size={16} />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Plus size={16} />}
                                onClick={() => setCurrentAuthor(prev => prev ? ({ ...prev, social_links: [...(prev.social_links || []), { platform: '', url: '' }] }) : null)}
                            >
                                Add Social Link
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAuthorDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>Save</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
}
