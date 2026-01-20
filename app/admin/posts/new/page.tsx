import { getSubjects, getTaxonomy } from '@/actions/cms/metadata';
import PostEditor from '@/components/admin/PostEditor';

export default async function NewPostAdminPage() {
    const subjects = await getSubjects();
    const taxonomy = await getTaxonomy();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Create New Lesson</h1>
            <PostEditor subjects={subjects} taxonomy={taxonomy} />
        </div>
    );
}
