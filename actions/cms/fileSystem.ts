'use server';

import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server';

const IS_DEV = process.env.NODE_ENV === 'development';

const GITHUB_OWNER = process.env.GITHUB_OWNER!;
// Use Demo Repo in Dev, otherwise Production Repo
const GITHUB_REPO = IS_DEV && process.env.GITHUB_REPO_DEMO
  ? process.env.GITHUB_REPO_DEMO.trim()
  : process.env.GITHUB_REPO!;

// Helper to get authenticated user email username
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error('User not authenticated');
  }

  return {
    email: user.email,
    username: user.email.split('@')[0]
  };
}

// Initialize Octokit with appropriate token
function getOctokit() {
  const token = IS_DEV && process.env.GITHUB_TOKEN_DEMO
    ? process.env.GITHUB_TOKEN_DEMO.trim()
    : process.env.GITHUB_TOKEN;

  return new Octokit({
    auth: token,
  });
}

export async function getFileContent<T = any>(filePath: string): Promise<T | null> {
  // GITHUB STRATEGY ONLY
  const octokit = getOctokit();
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
    });

    if ('content' in data && !Array.isArray(data)) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      try {
        if (filePath.endsWith('.json')) {
          return JSON.parse(content) as T;
        }
        return content as unknown as T;
      } catch (e) {
        console.error(`Error parsing file content for ${filePath}:`, e);
        return content as unknown as T;
      }
    }
    return null;
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    console.error(`Error fetching file ${filePath}:`, error);
    throw error;
  }
}

// Helper to get directory content (list of files/subdirectories)
export async function getDirectoryContent(dirPath: string) {
  // GITHUB STRATEGY ONLY
  const octokit = getOctokit();
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: dirPath,
    });

    if (Array.isArray(data)) {
      return data.map(item => ({
        name: item.name,
        type: item.type, // 'file' or 'dir'
        path: item.path,
      }));
    }
    return [];
  } catch (error: any) {
    if (error.status === 404) {
      return [];
    }
    console.error(`Error fetching directory ${dirPath}:`, error);
    throw error;
  }
}

export async function saveFileContent(filePath: string, content: string | object, message: string) {
  // GITHUB STRATEGY ONLY
  const octokit = getOctokit();
  const { username } = await getAuthenticatedUser();

  try {
    // Check if file exists to get SHA
    let sha: string | undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: filePath,
      });
      if ('sha' in data) {
        sha = data.sha;
      }
    } catch (error: any) {
      if (error.status !== 404) throw error;
    }

    const contentString = typeof content === 'string'
      ? content
      : JSON.stringify(content, null, 2);

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      message: `${message} (by ${username})`,
      content: Buffer.from(contentString).toString('base64'),
      sha,
    });

    return { success: true, path: filePath };
  } catch (error: any) {
    console.error(`Error saving file ${filePath}:`, error);
    throw new Error(`Failed to save file: ${error.message}`);
  }
}
