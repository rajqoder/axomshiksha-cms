'use server';

import { getFileContent, saveFileContent } from './fileSystem';

// Type Definitions
export interface Subject {
    gradient?: string; // Optional now?
    description?: string;
    title?: string;
    classes?: string[]; // Valid Classes for this subject
    isLanguageSubject?: boolean;
}

export interface CategoryInfo {
    description: string;
    image?: string;
    type?: string;
    category?: string; // Parent Category Slug for SubCategories (Classes)
}

// The new categories.json is actually groups like "lower-primary", "upper-primary"
export type CategoriesData = Record<string, CategoryInfo>;

// The new sub-category.json contains "class-6", "apsc" etc. (The actual "Classes")
export type SubCategoriesData = Record<string, CategoryInfo>;

export type Taxonomy = Record<string, Record<string, string[]>>; // { category: { class: [subject_slugs] } }

const FILES = {
    SUBJECTS: 'data/subjects.json',
    CATEGORIES: 'data/categories.json',
    SUB_CATEGORIES: 'data/sub-category.json',
};

// Taxonomy Builder (File-Based)
export async function getTaxonomy(): Promise<Taxonomy> {
    const taxonomy: Taxonomy = {};

    // Fetch all metadata concurrently
    const [categories, subCategories, subjects] = await Promise.all([
        getCategories(),
        getSubCategories(),
        getSubjects()
    ]);

    // 1. Initialize Categories
    Object.keys(categories).forEach(catSlug => {
        taxonomy[catSlug] = {};
    });

    // 2. Map Classes (SubCategories) to Categories
    Object.entries(subCategories).forEach(([classSlug, classInfo]) => {
        const parentCategory = classInfo.category;
        if (parentCategory && taxonomy[parentCategory]) {
            taxonomy[parentCategory][classSlug] = [];
        } else {
            // Optional: Handle classes without category or invalid category?
            // For now, we skip them or maybe add to a 'uncategorized' bucket if needed.
            // Strict mode: Only add if valid parent.
        }
    });

    // 3. Map Subjects to Classes
    Object.entries(subjects).forEach(([subjectSlug, subjectInfo]) => {
        if (subjectInfo.classes && Array.isArray(subjectInfo.classes)) {
            subjectInfo.classes.forEach(classSlug => {
                // Find which category this class belongs to
                // We have to search the taxonomy tree or look up the class in subCategories
                const classInfo = subCategories[classSlug];
                if (classInfo && classInfo.category) {
                    const parentCategory = classInfo.category;
                    // Check if path exists in taxonomy
                    if (taxonomy[parentCategory] && taxonomy[parentCategory][classSlug]) {
                        taxonomy[parentCategory][classSlug].push(subjectSlug);
                    }
                }
            });
        }
    });

    return taxonomy;
}

// Subjects
export async function getSubjects() {
    const data = await getFileContent<Record<string, Subject>>(FILES.SUBJECTS);
    return data || {};
}

export async function updateSubjects(data: Record<string, Subject>) {
    return await saveFileContent(FILES.SUBJECTS, data, 'Update subjects');
}

// Categories (Groups)
export async function getCategories() {
    const data = await getFileContent<CategoriesData>(FILES.CATEGORIES);
    return data || {};
}

// Sub Categories (Classes/Streams) - The user refers to these as "Classes" in dropdowns
export async function getSubCategories() {
    const data = await getFileContent<SubCategoriesData>(FILES.SUB_CATEGORIES);
    return data || {};
}

// Alias for clarity in UI components
export const getClasses = getSubCategories;

export async function updateCategories(data: CategoriesData) {
    return await saveFileContent(FILES.CATEGORIES, data, 'Update categories');
}

export async function updateSubCategories(data: SubCategoriesData) {
    return await saveFileContent(FILES.SUB_CATEGORIES, data, 'Update sub-categories');
}
