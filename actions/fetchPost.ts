'use server';

import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server'; // Import the server-side Supabase client

interface PostData {
  title: string;
  slug: string;
  description: string;
  category: string; // Single category as a string
  tags: string[];
  content: string;
  published: boolean;
  readingTime: number | string; // Can be number or string depending on parsing
  thumbnail: string;
  useTagsAsKeywords: boolean;
  keywords: string[] | string; // Can be string or array depending on parsing
  date: string;
  status: string;
}

export async function fetchPostBySlug(slug: string): Promise<PostData | null> {
  try {
    // Initialize Octokit with the GitHub token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Look for the file with the author's email username in the filename
    // First, we need to get all files in the content directory to find the right filename
    const { data: fileList } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: 'content',
    });

    // Filter for markdown files that match our slug pattern
    const matchingFiles = Array.isArray(fileList) 
      ? fileList.filter(file => 
          file.type === 'file' && 
          file.name.endsWith('.md') &&
          // Check if the filename starts with our slug followed by a hyphen
          file.name.startsWith(`${slug}-`) 
        )
      : [];

    if (matchingFiles.length === 0) {
      console.log(`No file found for slug: ${slug}`);
      return null;
    }

    // Use the first matching file
    const file = matchingFiles[0];
    const filePath = `content/${file.name}`;

    // Get the repository information from environment variables
    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;

    // Get the file content
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    // Decode the content
    const encodedContent = (data as any).content;
    const decodedContent = Buffer.from(encodedContent, 'base64').toString('utf-8');

    // Parse the frontmatter and content
    const { frontmatter, content } = parseFrontmatter(decodedContent);

    // Convert the frontmatter to the expected format
    const postData: PostData = {
      title: frontmatter.title || '',
      slug: frontmatter.slug || slug, // Use slug from frontmatter if available, otherwise use the passed slug
      description: frontmatter.description || '',
      category: Array.isArray(frontmatter.categories) ? frontmatter.categories[0] || '' : (typeof frontmatter.categories === 'string' ? frontmatter.categories : ''),
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      content: content,
      published: !frontmatter.draft,
      readingTime: typeof frontmatter.readingTime === 'number' ? frontmatter.readingTime : parseInt(frontmatter.readingTime) || 5,
      thumbnail: frontmatter.thumbnail || '',
      useTagsAsKeywords: false, // Default to false, will be determined based on tags vs keywords
      keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : (typeof frontmatter.keywords === 'string' ? [frontmatter.keywords] : []),
      date: frontmatter.date || new Date().toISOString(),
      status: frontmatter.draft ? 'Draft' : 'Published',
    };

    return postData;
  } catch (error) {
    console.error('Error fetching post from GitHub:', error);
    return null;
  }
}

// Helper function to parse frontmatter from markdown content
function parseFrontmatter(content: string) {
  // Regular expression to match TOML frontmatter (Hugo format)
  const frontmatterRegex = /^\+{3}\n([\s\S]*?)\n\+{3}\n?([\s\S]*)/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const frontmatterStr = match[1];
    const contentStr = match[2] || '';

    // Parse TOML frontmatter manually - define as any initially to allow different types
    const frontmatter: Record<string, any> = {};
    
    // Split by newlines and parse key-value pairs
    const lines = frontmatterStr.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf('=');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value: any = line.substring(colonIndex + 1).trim();
        
        // Remove quotes and handle arrays
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith('[') && value.endsWith(']')) {
          // Parse array format: ["tag1", "tag2"]
          const arrayContent = value.substring(1, value.length - 1);
          value = arrayContent
            .split(',')
            .map((item: string) => item.trim().replace(/"/g, ''))
            .filter((item: string) => item.length > 0);
        } else if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else if (!isNaN(Number(value))) {
          // Convert numeric strings to numbers
          value = Number(value);
        }
        
        frontmatter[key] = value;
      }
    }

    return { frontmatter, content: contentStr };
  }

  // If no frontmatter found, return content as is
  return { frontmatter: {}, content };
}



export async function getAllPosts(filterByCurrentUser: boolean = false): Promise<PostData[]> {
  try {
    // Get the current user session to retrieve user information
    const supabase = await createClient();
    
    let userEmailUsername = null;
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        userEmailUsername = user.email.split('@')[0];
      }

    // Initialize Octokit with the GitHub token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Get the repository information from environment variables
    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;

    // Get all files in the content directory
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: 'content',
    });

    const posts: PostData[] = [];

    if (Array.isArray(data)) {
      // Filter for markdown files
      let markdownFiles = data.filter(item => 
        item.type === 'file' && item.name.endsWith('.md')
      );
      
      // If filtering by current user, filter files by the author in filename
      if (filterByCurrentUser && userEmailUsername) {
        markdownFiles = markdownFiles.filter(file => {
          const fileNameWithoutExt = file.name.replace('.md', '');
          return fileNameWithoutExt.endsWith(`-${userEmailUsername}`);
        });
      }

      // Fetch content for each markdown file
      for (const file of markdownFiles) {
        const fileNameWithoutExt = file.name.replace('.md', '');
        // Extract the original slug from the filename (before the last hyphen and email username)
        const lastHyphenIndex = fileNameWithoutExt.lastIndexOf('-');
        const slug = lastHyphenIndex !== -1 ? fileNameWithoutExt.substring(0, lastHyphenIndex) : fileNameWithoutExt;
        
        const postData = await fetchPostBySlug(slug);
        if (postData) {
          // Update the slug in the returned data to use the slug from frontmatter if available
          // This ensures we're using the intended slug for the post, not derived from filename
          posts.push(postData);
        }
      }
    }

    return posts;
  } catch (error) {
    console.error('Error fetching all posts from GitHub:', error);
    return [];
  }
}
