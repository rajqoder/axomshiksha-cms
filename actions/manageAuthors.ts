'use server';

import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server';

const IS_DEV = process.env.NODE_ENV === 'development';
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = IS_DEV ? process.env.GITHUB_REPO_DEMO! : process.env.GITHUB_REPO!;
const GITHUB_TOKEN = IS_DEV ? process.env.GITHUB_TOKEN_DEMO! : process.env.GITHUB_TOKEN!;

const WRITERS_FILE_PATH = 'data/writers.json';

export interface Author {
    handle: string;
    name: string;
    email: string;
    role: 'admin' | 'author';
    bio?: string;
    avatar?: string;
    social_links?: { platform: string; url: string }[];
    joinedon?: string;
    isVerifiedByAdmin?: boolean;
}

export async function getAllAuthors(): Promise<{ success: boolean; data?: Author[]; message?: string }> {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { success: false, message: 'Unauthorized' };

        const octokit = new Octokit({
            auth: GITHUB_TOKEN,
            request: {
                fetch: (url: any, options: any) => {
                    return fetch(url, {
                        ...options,
                        cache: 'no-store',
                        next: { revalidate: 0 }
                    });
                }
            }
        });

        try {
            const { data } = await octokit.rest.repos.getContent({
                owner: GITHUB_OWNER,
                repo: GITHUB_REPO,
                path: WRITERS_FILE_PATH,
            });

            if ('content' in data && !Array.isArray(data)) {
                const content = Buffer.from(data.content, 'base64').toString('utf-8');
                const json = JSON.parse(content);

                // Convert dictionary to array
                const authors: Author[] = Object.entries(json).map(([key, value]: [string, any]) => ({
                    handle: key,
                    name: value.name,
                    email: value.email,
                    role: value.role || 'author',
                    bio: value.bio,
                    avatar: value.avatar,
                    social_links: value.social_links,
                    joinedon: value.joinedon
                }));

                return { success: true, data: authors };
            }
        } catch (error: any) {
            if (error.status === 404) {
                return { success: true, data: [] };
            }
            throw error;
        }

        return { success: false, message: 'Failed to parse writers data' };
    } catch (error: any) {
        console.error('Fetch authors error:', error);
        return { success: false, message: error.message };
    }
}

export async function saveAuthor(author: Author): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { success: false, message: 'Unauthorized' };

        // Verify current user is admin (optional, but good practice)
        // For now trusting the UI protection, but ideally should check session user's role here too.

        const octokit = new Octokit({
            auth: GITHUB_TOKEN,
            request: {
                fetch: (url: any, options: any) => {
                    return fetch(url, {
                        ...options,
                        cache: 'no-store',
                        next: { revalidate: 0 }
                    });
                }
            }
        });

        // 1. Fetch existing
        let currentData: Record<string, any> = {};
        let sha: string | undefined;

        try {
            const { data } = await octokit.rest.repos.getContent({
                owner: GITHUB_OWNER,
                repo: GITHUB_REPO,
                path: WRITERS_FILE_PATH,
            });

            if ('content' in data && !Array.isArray(data)) {
                const content = Buffer.from(data.content, 'base64').toString('utf-8');
                currentData = JSON.parse(content);
                sha = data.sha;
            }
        } catch (error: any) {
            if (error.status !== 404) throw error;
        }

        // 2. Update data
        const { handle, ...details } = author;

        // Preserve existing fields
        const existing = currentData[handle] || {};

        const mergedData = {
            ...existing,
            ...details,
            joinedon: existing.joinedon || details.joinedon || new Date().toISOString().split('T')[0],
            social_links: details.social_links || existing.social_links || []
        };

        // If role is admin, remove isVerifiedByAdmin (implicitly verified)
        if (mergedData.role === 'admin') {
            delete mergedData.isVerifiedByAdmin;
        } else {
            // Ensure it exists if not admin? Or just carry over what's passed
            // If passed in details, use it. If not, preserve.
            if (details.isVerifiedByAdmin !== undefined) {
                mergedData.isVerifiedByAdmin = details.isVerifiedByAdmin;
            }
        }

        currentData[handle] = mergedData;

        // 3. Save
        const updatedContent = JSON.stringify(currentData, null, 2);

        await octokit.rest.repos.createOrUpdateFileContents({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path: WRITERS_FILE_PATH,
            message: `Update author: ${handle}`,
            content: Buffer.from(updatedContent).toString('base64'),
            sha: sha,
        });

        return { success: true, message: 'Author saved successfully' };

    } catch (error: any) {
        console.error('Save author error:', error);
        return { success: false, message: error.message };
    }
}

export async function deleteAuthor(handle: string): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { success: false, message: 'Unauthorized' };

        const octokit = new Octokit({
            auth: GITHUB_TOKEN,
            request: {
                fetch: (url: any, options: any) => {
                    return fetch(url, {
                        ...options,
                        cache: 'no-store',
                        next: { revalidate: 0 }
                    });
                }
            }
        });

        // 1. Fetch
        const { data } = await octokit.rest.repos.getContent({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path: WRITERS_FILE_PATH,
        });

        if (!('content' in data) || Array.isArray(data)) {
            return { success: false, message: 'Data file invalid' };
        }

        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        const currentData = JSON.parse(content);

        // 2. Delete
        if (currentData[handle]) {
            delete currentData[handle];
        } else {
            return { success: false, message: 'Author not found' };
        }

        // 3. Save
        await octokit.rest.repos.createOrUpdateFileContents({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path: WRITERS_FILE_PATH,
            message: `Delete author: ${handle}`,
            content: Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64'),
            sha: data.sha,
        });

        return { success: true, message: 'Author deleted successfully' };

    } catch (error: any) {
        console.error('Delete author error:', error);
        return { success: false, message: error.message };
    }
}
