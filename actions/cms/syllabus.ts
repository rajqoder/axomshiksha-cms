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
function getSyllabusPath(className: string, subject: string, group: string = 'upper-primary') {
    return `data/syllabus/${group}/${className}/${subject}.json`;
}

export async function getSyllabus(className: string, subject: string, group: string = 'upper-primary') {
    const path = getSyllabusPath(className, subject, group);
    const data = await getFileContent<Syllabus>(path);
    return data;
}

export async function updateSyllabus(
    className: string,
    subject: string,
    data: Syllabus,
    group: string = 'upper-primary'
) {
    const path = getSyllabusPath(className, subject, group);
    return await saveFileContent(path, data, `Update syllabus for ${className} ${subject}`);
}
