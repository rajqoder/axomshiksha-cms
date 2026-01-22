'use client';

import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Avatar,
    Stack,
    IconButton
} from '@mui/material';
import { getAllPosts } from '../../actions/fetchPost';
import { deletePost } from '../../actions/deletePost';
import Link from 'next/link';
import { Edit, Trash } from 'lucide-react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button
} from '@mui/material';

interface PostData {
    title: string;
    slug: string;
    description: string;
    category: string;
    content: string;
    published: boolean;
    readingTime: number | string;
    thumbnail: string;
    keywords: string[] | string;
    date: string;
    status: string;
    author: string;
    // Extended Metadata for external linking
    class?: string;
    subject?: string;
    medium?: string;
}

export default function AdminDashboard() {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<{
        slug: string;
        title: string;
    } | null>(null);

    const handleDeleteClick = (slug: string, title: string) => {
        setPostToDelete({ slug, title });
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!postToDelete) return;

        try {
            const result = await deletePost(postToDelete.slug);
            if (result.success) {
                // Refresh posts
                const data = await getAllPosts(false);
                setPosts(data);
                alert(result.message);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post");
        } finally {
            setDeleteDialogOpen(false);
            setPostToDelete(null);
        }
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch ALL posts (false for filterByCurrentUser)
                const data = await getAllPosts(false);
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const columns: GridColDef[] = [
        {
            field: 'title',
            headerName: 'Title',
            width: 400,
            renderCell: (params: GridRenderCellParams) => {
                const row = params.row as PostData;
                // Construct external URL: axomshiksha.com/<class>/<subject>/<medium>/<post-slug>
                // row.slug contains "class/subject/post-slug"
                // explicit fields class/subject/medium are available from fetchPost

                let externalUrl = '#';
                if (row.class && row.subject) {
                    // Extract the leaf slug from the full slug path if needed
                    const leafSlug = row.slug.split('/').pop() || row.slug;
                    externalUrl = `https://axomshiksha.com/${row.class}/${row.subject}/${row.medium || 'english'}/${leafSlug}`;
                } else {
                    // Fallback using raw slug if metadata is missing
                    externalUrl = `https://axomshiksha.com/${row.slug}`;
                }

                return (
                    <a
                        href={externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}
                    >
                        {params.value}
                    </a>
                );
            }
        },
        {
            field: 'author',
            headerName: 'Author',
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    avatar={<Avatar>{params.value ? params.value[0]?.toUpperCase() : '?'}</Avatar>}
                    label={params.value || 'Unknown'}
                    variant="outlined"
                    size="small"
                />
            )
        },
        { field: 'category', headerName: 'Category', width: 150 },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value}
                    color={params.value === 'Published' ? 'success' : 'default'}
                    size="small"
                />
            )
        },
        { field: 'date', headerName: 'Date', width: 220 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="center"
                    sx={{ height: '100%', width: '100%' }}
                >
                    <IconButton
                        component={Link}
                        href={`/posts/edit/${params.row.slug}`}
                        size="small"
                        title="Edit"
                    >
                        <Edit size={16} />
                    </IconButton>
                    <IconButton
                        color="error"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(params.row.slug, params.row.title);
                        }}
                        title="Delete"
                    >
                        <Trash size={16} />
                    </IconButton>
                </Stack>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Total Posts
                        </Typography>
                        <Typography variant="h4">
                            {posts.length}
                        </Typography>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Published
                        </Typography>
                        <Typography variant="h4">
                            {posts.filter(p => p.status === 'Published').length}
                        </Typography>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Drafts
                        </Typography>
                        <Typography variant="h4">
                            {posts.filter(p => p.status === 'Draft').length}
                        </Typography>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        All Content
                    </Typography>
                    <div style={{ height: 500, width: '100%' }}>
                        <DataGrid
                            rows={posts.map((post, i) => ({ ...post, id: i }))}
                            columns={columns}
                            loading={loading}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 10 },
                                },
                            }}
                            pageSizeOptions={[10, 20]}
                            checkboxSelection
                            disableRowSelectionOnClick
                        />
                    </div>
                </CardContent>
            </Card>


            {/* Delete confirmation */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete “{postToDelete?.title}”? This action
                        cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    );
}
