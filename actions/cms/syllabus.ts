'use server';

import { getFileContent, saveFileContent } from './fileSystem';

export interface Chapter {
    title: string;
    title_as?: string;
}

export interface Syllabus {
    title: string;
    title_as?: string;
    chapters: Chapter[];
}

// Helper to construct path
// group: 'upper-primary' (fixed for now or passed)
// className: 'class-6'
// subject: 'social-science'
// Helper: Slugify string
function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function getSyllabusPath(className: string, subject: string, group: string) {
    return `data/syllabus/${group}/${className}/${slugify(subject)}.json`;
}

export async function getSyllabus(className: string, subject: string, group: string) {
    const path = getSyllabusPath(className, subject, group);
    try {
        const data = await getFileContent<Syllabus>(path);
        return data;
    } catch (e) {
        return null;
    }
}

export async function updateSyllabus(
    className: string,
    subject: string,
    data: Syllabus,
    group: string
) {
    const path = getSyllabusPath(className, subject, group);
    return await saveFileContent(path, data, `Update syllabus for ${className} ${subject}`);
}
