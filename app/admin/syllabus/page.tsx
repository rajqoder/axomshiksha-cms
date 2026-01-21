import { getTaxonomy, getSubCategories } from '@/actions/cms/metadata';
import { getSyllabus } from '@/actions/cms/syllabus';
import SyllabusEditor from '@/components/admin/SyllabusEditor';
import SyllabusSelector from '@/components/admin/SyllabusSelector';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SyllabusPage({ searchParams }: PageProps) {
    const taxonomy = await getTaxonomy();
    const subCategories = await getSubCategories();

    const resolvedSearchParams = await searchParams;
    const currentClass = typeof resolvedSearchParams.class === 'string' ? resolvedSearchParams.class : '';
    const currentSubject = typeof resolvedSearchParams.subject === 'string' ? resolvedSearchParams.subject : '';

    // Determine Group (Category)
    // Default to 'upper-primary' if not found, but we should find it.
    let currentGroup = 'upper-primary';
    if (currentClass && subCategories[currentClass] && subCategories[currentClass].category) {
        currentGroup = subCategories[currentClass].category!;
    }

    let syllabusData = null;
    if (currentClass && currentSubject) {
        syllabusData = await getSyllabus(currentClass, currentSubject, currentGroup);
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Syllabus Management</h1>

            {/* Selector Section */}
            <SyllabusSelector taxonomy={taxonomy} />

            {/* Editor Section */}
            {currentClass && currentSubject ? (
                <SyllabusEditor
                    key={`${currentClass}-${currentSubject}`}
                    initialSyllabus={syllabusData}
                    classNameParam={currentClass}
                    subjectParam={currentSubject}
                    groupParam={currentGroup}
                />
            ) : (
                <div className="text-center text-gray-500 py-12 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    Please select a category, class and subject to view or edit the syllabus.
                </div>
            )}
        </div>
    );
}
