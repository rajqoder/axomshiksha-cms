'use client';

import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import Link from 'next/link';
import { getAllPosts } from '../../actions/fetchPost';
import { deletePost } from '../../actions/deletePost';
import { useAuth } from '../../contexts/AuthContext';
import { Edit, Trash, Plus } from 'lucide-react';

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
}

const PostsPage = () => {
  const [postsData, setPostsData] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
        const posts = await getAllPosts(!!user);
        setPostsData(posts);
        alert(result.message);
      } else {
        alert(result.message);
      }
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  useEffect(() => {
    const loadPosts = async () => {
      const posts = await getAllPosts(!!user);
      setPostsData(posts);
      setLoading(false);
    };
    loadPosts();
  }, [user]);

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Link
          href={`/posts/${params.row.slug}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {params.value}
        </Link>
      ),
    },
    { field: 'slug', headerName: 'Slug', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', flex: 0.5, minWidth: 120 },
    { field: 'date', headerName: 'Date', flex: 0.5, minWidth: 120 },
    { field: 'status', headerName: 'Status', flex: 0.5, minWidth: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction={'row'} spacing={1} alignItems="center">
          <IconButton
            component={Link}
            href={`/posts/${params.row.slug}/edit`}
            sx={{ mr: 1 }}
          >
            <Edit />
          </IconButton>
          <IconButton
            color='error'
            aria-label='delete post'
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(params.row.slug, params.row.title);
            }}
          >
            <Trash />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h6">Loading posts…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '90%', maxWidth: 1200, my: 4 }}>
        <CardHeader
          title="Manage Posts"
          action={
            <Tooltip title="Create New Post">
              <IconButton
                component={Link}
                href="/new-post"
                color="primary"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 1,
                  px: 2,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <Plus size={20} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  New
                </Typography>
              </IconButton>
            </Tooltip>
          }
        />
        <CardContent>
          <Box sx={{ height: 400, width: '100%', my: 2 }}>
            <DataGrid
              rows={postsData.map((post, index) => ({ ...post, id: index }))}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
              density="compact"
              disableRowSelectionOnClick
            />
          </Box>
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
    </Box>
  );
};

export default PostsPage;
