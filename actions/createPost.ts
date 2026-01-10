'use server';

import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server';

interface FormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  published: boolean;
  readingTime: number;
  thumbnail: string;
  useTagsAsKeywords: boolean;
  keywords: string[];
}

export async function createPost(formData: FormData) {
  try {
    // Get the current user session to retrieve user information
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if(!user || !user.email) return { success: false, message: 'User not authenticated or email not available' };

    // Get the user's email username
    const userEmailUsername = user.email.split('@')[0];

    // Initialize Octokit with the GitHub token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Prepare the file path with the author's email username included in the filename
    const fileName = `${formData.slug}-${userEmailUsername}`;
    const filePath = `content/${fileName}.md`;
    
    // Determine keywords based on form data
    const keywords = formData.useTagsAsKeywords ? formData.tags : formData.keywords;

    // Format the current date for the frontmatter
    const currentDate = new Date();
    // Format as YYYY-MM-DDTHH:mm:ss+HH:MM
    const dateString = currentDate.getFullYear() + '-' + 
                   String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(currentDate.getDate()).padStart(2, '0') + 'T' +
                   String(currentDate.getHours()).padStart(2, '0') + ':' + 
                   String(currentDate.getMinutes()).padStart(2, '0') + ':' + 
                   String(currentDate.getSeconds()).padStart(2, '0') + 
                   getTimezoneOffset(currentDate);

    // Helper function to get timezone offset in +HH:MM format
    function getTimezoneOffset(date: Date): string {
      const offsetMinutes = -date.getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const absOffsetMinutes = Math.abs(offsetMinutes);
      const hours = Math.floor(absOffsetMinutes / 60);
      const minutes = absOffsetMinutes % 60;
      return sign + String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
    }

    // Create the frontmatter with the slug field
    const frontmatter = `+++
title = "${formData.title}"
draft = ${!formData.published}
date = "${dateString}"
readingTime = "${formData.readingTime} mins"
description = "${formData.description}"
tags = [${formData.tags.map(tag => `"${tag}"`).join(', ')}]
keywords = [${keywords.map(keyword => `"${keyword}"`).join(', ')}]
categories = ["${formData.category}"]
writers = ["${userEmailUsername}"]
thumbnail = "${formData.thumbnail}"
slug = "${formData.slug}"
+++
`;

    // Combine frontmatter and content
    const fileContent = frontmatter + formData.content;

    // Check if file exists (for update scenario)
    let fileExists = false;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        path: filePath,
      });
      fileExists = true;
    } catch (error) {
      // File doesn't exist, this is a create operation
      fileExists = false;
    }

    let result;
    if (fileExists) {
      // Get the SHA of the existing file for update
      const { data } = await octokit.rest.repos.getContent({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        path: filePath,
      });

      // Update the file
      result = await octokit.rest.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        path: filePath,
        message: `Update: ${formData.title} by ${userEmailUsername}`,
        content: Buffer.from(fileContent).toString('base64'),
        sha: (data as any).sha,
      });

      // Return success message for update
      return {
        success: true,
        message: `The post has been updated successfully`,
        filePath: filePath
      };
    } else {
      // Create the file
      result = await octokit.rest.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        path: filePath,
        message: `Create: ${formData.title} by ${userEmailUsername}`,
        content: Buffer.from(fileContent).toString('base64'),
      });

      // Return success message for creation
      return {
        success: true,
        message: `The post has been ${formData.published ? 'published' : 'saved as draft'}`,
        filePath: filePath
      };
    }
  } catch (error: any) {
    console.error('Error creating/updating post:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}