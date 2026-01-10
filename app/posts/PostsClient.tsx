'use client';

import dynamic from 'next/dynamic';

const PostsPage = dynamic(() => import('./PostsPage'), {
  ssr: false,
});

export default function PostsClient() {
  return <PostsPage />;
}
