'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchPostBySlug } from '@/actions/fetchPost';

interface PostData {
  title: string;
  slug: string;
  description: string;
  category: string;
  content: string;
  published: boolean;
  readingTime: number | string; // Matches the type from fetchPostBySlug
  thumbnail: string;
  keywords: string[] | string; // Matches the type from fetchPostBySlug
  date: string;
  status: string;
}

const PostDetailPage = () => {
  const { filename } = useParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (filename) {
        const slug = Array.isArray(filename) ? filename[0] : filename;
        const postData = await fetchPostBySlug(slug);
        setPost(postData);
        setLoading(false);
      }
    };

    loadPost();
  }, [filename]);

  if (loading) {
    return (
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h6">Loading post...</Typography>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h6">Post not found</Typography>
        <Button variant="contained" component={Link} href="/posts" sx={{ mt: 2 }}>
          Back to Posts
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              {post.title}
            </Typography>
            <Chip label={post.status} color={post.status === 'Published' ? 'success' : 'warning'} />
          </Box>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            {post.date} | {post.category} | {post.slug}
          </Typography>
          <Typography variant="body1" paragraph>
            {post.description}
          </Typography>
          <Box
            sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
          />
        </CardContent>
        <CardActions>
          <Button variant="contained" component={Link} href="/posts">
            Back to Posts
          </Button>
          <Button variant="outlined" component={Link} href={`/posts/${post.slug}/edit`}>
            Edit Post
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default PostDetailPage;