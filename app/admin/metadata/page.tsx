import { getSubjects, getCategories, getSubCategories } from '@/actions/cms/metadata';
import MetadataForms from '@/components/admin/MetadataForms';

export default async function MetadataPage() {
    const subjects = await getSubjects();
    const categories = await getCategories();
    const subCategories = await getSubCategories();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Metadata Management</h1>
            <MetadataForms
                initialSubjects={subjects}
                initialCategories={categories}
                initialSubCategories={subCategories}
            />
        </div>
    );
}
