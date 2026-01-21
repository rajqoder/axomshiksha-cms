import { getSubjects, getTaxonomy } from '@/actions/cms/metadata';
import PostEditor from '@/components/admin/PostEditor';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  const subjects = await getSubjects();
  const taxonomy = await getTaxonomy();

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <h1 className="text-3xl font-bold mb-6">Create Post</h1>
      <PostEditor subjects={subjects} taxonomy={taxonomy} />
    </div>
  );
}