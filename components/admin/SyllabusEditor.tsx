'use client';

import { useState } from 'react';
import { Chapter, Syllabus, updateSyllabus } from '@/actions/cms/syllabus';
import { Plus, Trash2, Save } from 'lucide-react';

interface SyllabusEditorProps {
    initialSyllabus: Syllabus | null;
    classNameParam: string;
    subjectParam: string;
}

export default function SyllabusEditor({ initialSyllabus, classNameParam, subjectParam }: SyllabusEditorProps) {
    // Default structure if null
    const [syllabus, setSyllabus] = useState<Syllabus>(initialSyllabus || {
        title: '',
        title_as: '',
        chapters: []
    });
    const [status, setStatus] = useState('');

    const handleChapterChange = (index: number, field: keyof Chapter, value: string) => {
        const newChapters = [...syllabus.chapters];
        newChapters[index] = { ...newChapters[index], [field]: value };
        setSyllabus({ ...syllabus, chapters: newChapters });
    };

    const addChapter = () => {
        setSyllabus({
            ...syllabus,
            chapters: [...syllabus.chapters, { title: '', title_as: '' }]
        });
    };

    const removeChapter = (index: number) => {
        const newChapters = syllabus.chapters.filter((_, i) => i !== index);
        setSyllabus({ ...syllabus, chapters: newChapters });
    };

    const handleSave = async () => {
        try {
            setStatus('Saving...');
            await updateSyllabus(classNameParam, subjectParam, syllabus);
            setStatus('Saved successfully!');
        } catch (e: any) {
            setStatus(`Error: ${e.message}`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Syllabus: {classNameParam} / {subjectParam}</h2>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={!classNameParam || !subjectParam}
                >
                    <Save className="w-4 h-4" /> Save
                </button>
            </div>

            {status && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded">
                    {status}
                </div>
            )}

            {/* Main Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-medium mb-1">Subject Title (English)</label>
                    <input
                        type="text"
                        value={syllabus.title}
                        onChange={(e) => setSyllabus({ ...syllabus, title: e.target.value })}
                        className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Subject Title (Assamese)</label>
                    <input
                        type="text"
                        value={syllabus.title_as || ''}
                        onChange={(e) => setSyllabus({ ...syllabus, title_as: e.target.value })}
                        className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                    />
                </div>
            </div>

            {/* Chapters List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="font-semibold">Chapters</h3>
                    <button
                        onClick={addChapter}
                        className="flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                    >
                        <Plus className="w-3 h-3" /> Add Chapter
                    </button>
                </div>

                {syllabus.chapters.length === 0 && (
                    <p className="text-gray-500 italic">No chapters defined.</p>
                )}

                {syllabus.chapters.map((chapter, index) => (
                    <div key={index} className="flex gap-4 items-start p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-800">
                        <span className="mt-2 text-sm text-gray-400 font-mono">#{index + 1}</span>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Chapter Title (English)"
                                value={chapter.title}
                                onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                            />
                            <input
                                type="text"
                                placeholder="Chapter Title (Assamese)"
                                value={chapter.title_as || ''}
                                onChange={(e) => handleChapterChange(index, 'title_as', e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                        <button
                            onClick={() => removeChapter(index)}
                            className="mt-2 text-red-500 hover:text-red-700"
                            title="Remove Chapter"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
