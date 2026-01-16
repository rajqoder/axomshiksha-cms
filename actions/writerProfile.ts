'use server';

import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server';

const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const WRITERS_FILE_PATH = 'data/writers.json';

export interface SocialLink {
    platform: string;
    url: string;
}

export interface WriterProfile {
    name: string;
    bio: string;
    joinedon: string;
    social_links: SocialLink[];
    image?: string; // Optional: for future use or if we want to store avatar URL
    email?: string;
}

export async function getWriterProfile(): Promise<{ success: boolean; data?: WriterProfile; message?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return { success: false, message: 'User not authenticated' };
        }

        const username = user.email.split('@')[0];

        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        });

        let currentData = {};
        try {
            const { data } = await octokit.rest.repos.getContent({
                owner: GITHUB_OWNER,
                repo: GITHUB_REPO,
                path: WRITERS_FILE_PATH,
            });

            if ('content' in data && !Array.isArray(data)) {
                const content = Buffer.from(data.content, 'base64').toString('utf-8');
                currentData = JSON.parse(content);
            }
        } catch (error: any) {
            if (error.status === 404) {
                // If file doesn't exist, we'll start with empty
                currentData = {};
            } else {
                console.error('Error fetching writers.json:', error);
                return { success: false, message: 'Failed to fetch writers data' };
            }
        }

        const profile = (currentData as any)[username];

        if (profile) {
            return {
                success: true,
                data: {
                    ...profile,
                    social_links: profile.social_links || []
                }
            };
        } else {
            // Return a default structure if not found
            return {
                success: true,
                data: {
                    name: user.user_metadata?.display_name || '',
                    bio: '',
                    joinedon: new Date().toISOString().split('T')[0],
                    social_links: [],
                    email: user.email
                }
            };
        }

    } catch (error: any) {
        console.error('Error in getWriterProfile:', error);
        return { success: false, message: error.message };
    }
}

export async function updateWriterProfile(profileData: WriterProfile): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return { success: false, message: 'User not authenticated' };
        }

        const username = user.email.split('@')[0];

        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        });

        // 1. Fetch existing data
        let currentData: Record<string, WriterProfile> = {};
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
            if (error.status === 404) {
                // File doesn't exist, will be created
            } else {
                console.error('Error fetching writers.json for update:', error);
                throw error;
            }
        }

        const { ...dataToSave } = profileData;
        
        currentData[username] = {
            ...currentData[username], // Keep existing fields if any
            ...dataToSave,
            email: user.email, // Ensure email is consistent
        };

        // 3. Commit back to GitHub
        const updatedContent = JSON.stringify(currentData, null, 2);

        await octokit.rest.repos.createOrUpdateFileContents({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path: WRITERS_FILE_PATH,
            message: `Update profile for ${username}`,
            content: Buffer.from(updatedContent).toString('base64'),
            sha: sha,
        });

        return { success: true, message: 'Profile updated successfully' };

    } catch (error: any) {
        console.error('Error in updateWriterProfile:', error);
        return { success: false, message: error.message };
    }
}
