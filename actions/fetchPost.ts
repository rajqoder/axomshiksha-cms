'use server';

import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server'; // Import the server-side Supabase client

interface PostData {
  title: string;
  slug: string;
  description: string;
  category: string; // Single category as a string
  content: string;
  published: boolean;
  readingTime: number | string; // Can be number or string depending on parsing
  thumbnail: string;
  keywords: string[] | string; // Can be string or array depending on parsing
  date: string;
  status: string;
  author: string;
  // Extended Metadata
  class?: string;
  subject?: string;
  medium?: string;
  chapter_title?: string;
}

// Recursively fetch all Markdown files from the repository
async function fetchAllMarkdownFiles(octokit: Octokit, owner: string, repo: string, treeSha: string = 'HEAD'): Promise<any[]> {
  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: 'true',
  });

  if (!data.tree) return [];

  return data.tree.filter((item: any) =>
    item.type === 'blob' &&
    item.path.startsWith('content/') &&
    item.path.endsWith('.md') &&
    !item.path.endsWith('_index.md') &&
    // Exclude root-level files (e.g. content/about.md) by ensuring path has subdirectories
    item.path.split('/').length > 2
  );
}

export async function fetchPostBySlug(slug: string): Promise<PostData | null> {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;

    const files = await fetchAllMarkdownFiles(octokit, owner, repo);

    const matchingFile = files.find((file: any) => {
      const filePath = file.path.replace('content/', '').replace('.md', '');
      const isMatch = filePath.startsWith(slug) && (
        filePath.length === slug.length ||
        filePath.charAt(slug.length) === '-'
      );

      return isMatch;
    });

    if (!matchingFile) {
      return null;
    }

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: matchingFile.path,
    });

    if (Array.isArray(data) || !('content' in data)) {
      return null;
    }

    const encodedContent = data.content;
    const decodedContent = Buffer.from(encodedContent, 'base64').toString('utf-8');
    const { frontmatter, content } = parseFrontmatter(decodedContent);

    // Get author from filename
    const parts = matchingFile.path.split('/');
    const fileName = parts[parts.length - 1];
    const fileNameWithoutExt = fileName.replace('.md', '');

    const lastHyphenIndex = fileNameWithoutExt.lastIndexOf('-');
    let authorHandle = '';
    if (lastHyphenIndex !== -1) {
      authorHandle = fileNameWithoutExt.substring(lastHyphenIndex + 1);
    }


    const postData: PostData = {
      title: frontmatter.title || '',
      slug: slug,
      description: frontmatter.description || '',
      category: Array.isArray(frontmatter.categories) ? frontmatter.categories[0] || '' : (typeof frontmatter.categories === 'string' ? frontmatter.categories : ''),
      content: content,
      published: !frontmatter.draft,
      readingTime: typeof frontmatter.readingTime === 'number' ? frontmatter.readingTime : parseInt(frontmatter.readingTime) || 5,
      thumbnail: frontmatter.thumbnail || '',
      keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : (typeof frontmatter.keywords === 'string' ? [frontmatter.keywords] : []),
      date: frontmatter.date || new Date().toISOString(),
      status: frontmatter.draft ? 'Draft' : 'Published',
      author: authorHandle
    };

    // Parse Path for Metadata
    // Structure: content/<class>/<subject>/[<medium>]/<filename>
    const pathParts = parts.slice(1); // Remove "content" -> ["class-6", "english", "..."]

    let classSlug = '';
    let subjectSlug = '';
    let mediumSlug = '';

    if (pathParts.length >= 2) {
      classSlug = pathParts[0];

      // Check if 2nd part is subject
      if (!pathParts[1].endsWith('.md')) {
        subjectSlug = pathParts[1];
      }

      // Check if 3rd part is medium
      if (pathParts.length >= 3 && !pathParts[2].endsWith('.md')) {
        // likely medium folder
        const mediumFolder = pathParts[2]; // e.g. "assamese-medium"
        mediumSlug = mediumFolder.replace('-medium', '');
      }
    }

    // Priority: Frontmatter Params > Path Inference
    // Some posts might explicitly save these in params
    const params = frontmatter.params || {};

    postData.class = params.class || classSlug;
    postData.subject = params.subject || subjectSlug;
    postData.medium = params.medium || mediumSlug;
    postData.chapter_title = params.chapter_title || '';

    return postData;
  } catch (error) {
    console.error('Error fetching post from GitHub:', error);
    return null;
  }
}

// Helper function to parse frontmatter from markdown content
export function parseFrontmatter(content: string) {
  const frontmatterRegex = /^\+{3}\n([\s\S]*?)\n\+{3}\n?([\s\S]*)/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const frontmatterStr = match[1];
    const contentStr = match[2] || '';

    // Parse TOML frontmatter manually
    const frontmatter: Record<string, any> = {};
    let currentSection: string | null = null;

    // Split by newlines
    const lines = frontmatterStr.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      // Check for section header [section]
      if (line.startsWith('[') && line.endsWith(']')) {
        const sectionName = line.substring(1, line.length - 1).trim();
        if (sectionName) {
          currentSection = sectionName;
          if (!frontmatter[currentSection]) {
            frontmatter[currentSection] = {};
          }
        }
        continue;
      }

      const equalIndex = line.indexOf('=');
      if (equalIndex > 0) {
        const key = line.substring(0, equalIndex).trim();
        let valueStr = line.substring(equalIndex + 1).trim();
        let value: any = valueStr;

        // Handle multi-line arrays
        if (valueStr.startsWith('[') && !valueStr.endsWith(']')) {
          // Read ahead until we find the closing bracket
          let accumulated = valueStr;
          let nextIdx = i + 1;
          while (nextIdx < lines.length) {
            const nextLine = lines[nextIdx].trim();
            if (!nextLine || nextLine.startsWith('#')) {
              nextIdx++;
              continue;
            }
            accumulated += " " + nextLine;
            i = nextIdx; // Advance outer loop
            if (nextLine.endsWith(']')) break;
            nextIdx++;
          }
          valueStr = accumulated;
        }

        // Value Parsing
        if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
          value = valueStr.substring(1, valueStr.length - 1);
        } else if (valueStr.startsWith("'") && valueStr.endsWith("'")) {
          value = valueStr.substring(1, valueStr.length - 1);
        } else if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
          // Parse array format: ["tag1", "tag2"]
          const arrayContent = valueStr.substring(1, valueStr.length - 1);
          value = arrayContent
            .split(',')
            .map((item: string) => item.trim().replace(/^["']|["']$/g, ''))
            .filter((item: string) => item.length > 0);
        } else if (valueStr === 'true') {
          value = true;
        } else if (valueStr === 'false') {
          value = false;
        } else if (!isNaN(Number(valueStr))) {
          value = Number(valueStr);
        }

        if (currentSection && frontmatter[currentSection]) {
          frontmatter[currentSection][key] = value;
        } else {
          frontmatter[key] = value;
        }
      }
    }

    return { frontmatter, content: contentStr };
  }

  // If no frontmatter found, return content as is
  return { frontmatter: {}, content };
}



export async function getAllPosts(filterByCurrentUser: boolean = false): Promise<PostData[]> {
  try {
    const supabase = await createClient();

    let userEmailUsername = null;
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      userEmailUsername = user.email.split('@')[0];
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;

    // Recursively fetch all markdown files
    const allMarkdownFiles = await fetchAllMarkdownFiles(octokit, owner, repo);

    const posts: PostData[] = [];

    // Filter and process files
    for (const file of allMarkdownFiles) {

      const relativePath = file.path.replace('content/', '').replace('.md', '');

      const lastHyphenIndex = relativePath.lastIndexOf('-');

      let authorHandle = '';
      let slug = relativePath;

      if (lastHyphenIndex !== -1) {
        authorHandle = relativePath.substring(lastHyphenIndex + 1);
        slug = relativePath.substring(0, lastHyphenIndex);
      }

      // Filter by user if requested
      if (filterByCurrentUser && userEmailUsername) {
        if (authorHandle !== userEmailUsername) {
          continue;
        }
      }

      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: file.path,
      });

      if (Array.isArray(data) || !('content' in data)) continue;

      const encodedContent = data.content;
      const decodedContent = Buffer.from(encodedContent, 'base64').toString('utf-8');
      const { frontmatter, content } = parseFrontmatter(decodedContent);

      posts.push({
        title: frontmatter.title || slug,
        slug: slug,
        description: frontmatter.description || '',
        category: Array.isArray(frontmatter.categories) ? frontmatter.categories[0] || '' : (typeof frontmatter.categories === 'string' ? frontmatter.categories : ''),
        content: content,
        published: !frontmatter.draft,
        readingTime: typeof frontmatter.readingTime === 'number' ? frontmatter.readingTime : parseInt(frontmatter.readingTime) || 5,
        thumbnail: frontmatter.thumbnail || '',
        keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : (typeof frontmatter.keywords === 'string' ? [frontmatter.keywords] : []),
        date: frontmatter.date || new Date().toISOString(),
        status: frontmatter.draft ? 'Draft' : 'Published',
        author: authorHandle
      });
    }

    return posts;
  } catch (error) {
    console.error('Error fetching all posts from GitHub:', error);
    return [];
  }
}
