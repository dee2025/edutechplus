'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// 🔥 VERY IMPORTANT: disable SSR
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
});

export default function QuillEditor({ value, onChange }) {
    return (
        <div className="bg-white rounded">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                style={{ minHeight: '300px' }}
            />
        </div>
    );
}
