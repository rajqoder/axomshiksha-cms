'use server';

import { saveFileContent, getAuthenticatedUser } from './cms/fileSystem';

interface FormData {
  title: string;
  slug: string;
  description: string;
  // Taxonomy - Optional for generic posts
  class?: string;       // e.g. "class-6"
  subject?: string;     // e.g. "social-science"
  medium?: string;      // "english" or "assamese"
  chapter_title?: string; // Linked to syllabus

  category: string;
  content: string;
  published: boolean;
  readingTime: number;
  thumbnail: string;
  keywords: string[];
}

export async function createPost(formData: FormData) {
  try {
    const { username } = await getAuthenticatedUser();

    // Ensure slug doesn't already have the extension
    const cleanSlug = formData.slug.replace(/\.md$/, '');
    const fileName = `${cleanSlug}.md`;

    let filePath = '';

    // Check if this is an academic post with full taxonomy
    if (formData.class && formData.subject && formData.medium) {
      // Pattern: content/<class>/<subject>/<medium>-medium/<slug>.md
      const mediumFolder = formData.medium.endsWith('-medium') ? formData.medium : `${formData.medium}-medium`;
      filePath = `content/${formData.class}/${formData.subject}/${mediumFolder}/${fileName}`;
    } else {
      // Fallback for generic posts
      // You might want to use formData.category if available, otherwise 'posts'
      const folder = formData.category ? formData.category.toLowerCase().replace(/\s+/g, '-') : 'posts';
      filePath = `content/${folder}/${fileName}`;
    }

    // Determine keywords
    const keywords = formData.keywords || [];

    // Date Format
    const currentDate = new Date();
    const dateString = currentDate.toISOString();

    // Build Frontmatter
    const keywordsString = JSON.stringify(keywords);
    const categoriesString = JSON.stringify([formData.category]);

    let frontmatter = `+++
title = "${formData.title}"
draft = ${!formData.published}
date = ${dateString}
readingTime = "${formData.readingTime} mins"
description = "${formData.description}"
keywords = ${keywordsString}
categories = ${categoriesString}
thumbnail = "${formData.thumbnail}"
slug = "${cleanSlug}"
`;

    // Add params section only if we have relevant data
    if (formData.chapter_title || formData.medium) {
      frontmatter += `
[params]
  author = "${username}"
`;
      if (formData.chapter_title) frontmatter += `  chapter_title = "${formData.chapter_title}"\n`;
      if (formData.medium) frontmatter += `  medium = "${formData.medium}"\n`;
    } else {
      // Just author for generic posts if no other params
      frontmatter += `
[params]
  author = "${username}"
`;
    }

    frontmatter += `+++
`;

    const fileContent = frontmatter + formData.content;

    // Use generic save helper
    const result = await saveFileContent(
      filePath,
      fileContent,
      `${formData.published ? 'Publish' : 'Draft'}: ${formData.title}`
    );

    return {
      success: true,
      message: `The post has been ${formData.published ? 'published' : 'saved as draft'}`,
      filePath: result.path
    };

  } catch (error: any) {
    console.error('Error creating/updating post:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}