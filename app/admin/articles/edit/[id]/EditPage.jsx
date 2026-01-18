'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArticleForm from '@/components/admin/ArticleForm';

export default function EditArticlePage({ id }) {
    const router = useRouter();
    const [article, setArticle] = useState(null);

    useEffect(() => {
        fetch(`/api/admin/articles/${id}`)
            .then(res => res.json())
            .then(setArticle);
    }, [id]);

    const handleUpdate = async (data) => {
        await fetch(`/api/admin/articles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        router.push('/admin/articles');
    };

    if (!article) return null;

    return (
        <div className="bg-[#111827] p-6 rounded-xl">
            <h1 className="text-xl font-bold mb-4">Edit Article</h1>
            <ArticleForm initialData={article} onSubmit={handleUpdate} />
        </div>
    );
}
