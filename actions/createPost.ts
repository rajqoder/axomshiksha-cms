'use server';

import { saveFileContent, getAuthenticatedUser, getFileContent } from './cms/fileSystem';

// Helper: Slugify string
function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Helper: Unslugify string (e.g. social-science -> Social Science)
function unslugify(slug: string) {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Helper: Ensure _index.md exists using provided title
async function ensureIndexFile(folderPath: string, title: string, dateString: string) {
  const indexPath = `${folderPath}/_index.md`;
  try {
    const existing = await getFileContent(indexPath);
    if (!existing) {
      const content = `+++
title = "${title}"
draft = false
date = "${dateString}"
+++
`;
      // We don't want to fail the whole request if this fails, so catching inside
      await saveFileContent(indexPath, content, `Create index for ${title}`);
    }
  } catch (err) {
    console.error(`Failed to ensure index file for ${folderPath}:`, err);
  }
}

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

    // Date Format
    const currentDate = new Date();
    const dateString = currentDate.toISOString().split(".")[0] + "+05:30";

    // Check if slug contains directory path (e.g. from editing an existing deep file)
    const hasPath = cleanSlug.includes('/') || cleanSlug.includes('\\');

    let fileName = '';
    let filePath = '';

    if (formData.class && formData.subject) {
      // Academic Post with Taxonomy: Construct path from Metadata
      // This allows "moving" the post if class/subject changes

      // Ensure slug is just the filename part if we are using metadata to drive structure
      let fileNameSlug = cleanSlug;
      if (fileNameSlug.includes('/') || fileNameSlug.includes('\\')) {
        const parts = fileNameSlug.split(/[/\\]/);
        fileNameSlug = parts[parts.length - 1]; // Take last part
      }

      fileName = `${fileNameSlug}-${username}.md`;

      // Slugify Class and Subject
      const classSlug = slugify(formData.class);
      const subjectSlug = slugify(formData.subject);

      // Ensure directory indices exist
      await ensureIndexFile(`content/${classSlug}`, unslugify(classSlug), dateString);
      await ensureIndexFile(`content/${classSlug}/${subjectSlug}`, unslugify(subjectSlug), dateString);

      // Construct Path
      let folderPath = `content/${classSlug}/${subjectSlug}`;

      if (formData.medium && formData.medium !== 'english') {
        const mediumFolder = formData.medium.endsWith('-medium') ? formData.medium : `${formData.medium}-medium`;
        folderPath += `/${mediumFolder}`;
      }

      filePath = `${folderPath}/${fileName}`;

    } else if (hasPath) {
      // Manual Path Override (Legacy or advanced use)
      const normalized = cleanSlug.replace(/\\/g, '/');
      const lastSlash = normalized.lastIndexOf('/');
      const dir = normalized.substring(0, lastSlash);
      const name = normalized.substring(lastSlash + 1);

      fileName = `${name}-${username}.md`;
      filePath = `content/${dir}/${fileName}`;
    } else {
      // Fallback for generic posts
      fileName = `${cleanSlug}-${username}.md`;
      const folder = formData.category ? formData.category.toLowerCase().replace(/\s+/g, '-') : 'posts';
      filePath = `content/${folder}/${fileName}`;
    }

    // Determine keywords
    const keywords = formData.keywords || [];

    // Build Frontmatter
    const keywordsString = JSON.stringify(keywords);
    const categoriesString = JSON.stringify([formData.category]);

    let frontmatter = `+++
title = "${formData.title}"
draft = ${!formData.published}
date = "${dateString}"
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