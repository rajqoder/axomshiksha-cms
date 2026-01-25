"use server";

import { createClient } from "@/lib/supabase/server";
import { Octokit } from 'octokit';
import { parseFrontmatter } from '@/lib/utils';

export async function deletePost(slug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) return { success: false, message: 'User not authenticated or email not available' };

  // Get the user's email username for verification
  const userEmailUsername = user.email.split('@')[0];

  const repo = process.env.GITHUB_REPO;
  const owner = process.env.GITHUB_OWNER;
  const filePath = `content/${slug}-${userEmailUsername}.md`;

  try {
    // Initialize Octokit with the GitHub token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // First, get the file to retrieve its content and SHA
    const { data } = await octokit.rest.repos.getContent({
      owner: owner!,
      repo: repo!,
      path: filePath,
    });

    // Decode the content to check the writers field in the frontmatter
    const encodedContent = (data as any).content;
    const decodedContent = Buffer.from(encodedContent, 'base64').toString('utf-8');

    // Parse the frontmatter to check if the user is authorized to delete
    const { frontmatter } = parseFrontmatter(decodedContent);

    // Check if the user is listed as a writer in the post
    const writers = frontmatter.writers;
    if (!writers || !Array.isArray(writers) || !writers.includes(userEmailUsername)) {
      return { success: false, message: 'User is not authorized to delete this post' };
    }

    // Delete the file
    const result = await octokit.rest.repos.deleteFile({
      owner: owner!,
      repo: repo!,
      path: filePath,
      message: `Delete: ${slug} by ${userEmailUsername}`,
      sha: (data as any).sha, // The SHA is required to delete the file
    });

    return { success: true, message: `Post ${slug} has been deleted successfully` };
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return { success: false, message: `Failed to delete post: ${error.message}` };
  }
}

