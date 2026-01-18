'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function RichTextEditor({ value, onChange }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value,

        // 🔥 REQUIRED for Next.js App Router
        immediatelyRender: false,

        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Prevent rendering until editor is ready
    if (!editor) return null;

    return (
        <div className="border border-gray-700 rounded bg-[#0b0f19]">
            <EditorContent
                editor={editor}
                className="p-4 min-h-[300px] prose prose-invert max-w-none"
            />
        </div>
    );
}
