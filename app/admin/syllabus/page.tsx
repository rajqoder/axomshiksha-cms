import { getTaxonomy, getSubCategories } from '@/actions/cms/metadata';
import { getSyllabus } from '@/actions/cms/syllabus';
import SyllabusEditor from '@/components/admin/SyllabusEditor';
import SyllabusSelector from '@/components/admin/SyllabusSelector';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

import { Paper, Typography } from '@mui/material';

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
                <Paper
                    variant="outlined"
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderStyle: 'dashed',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        bgcolor: 'rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <Typography color="text.secondary">
                        Please select a category, class and subject to view or edit the syllabus.
                    </Typography>
                </Paper>
            )}
        </div>
    );
}
