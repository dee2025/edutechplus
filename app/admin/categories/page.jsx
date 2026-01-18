'use client';

import { useEffect, useState } from 'react';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // form state
    const [editId, setEditId] = useState(null);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(1);

    const fetchCategories = async () => {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        setCategories(data);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const resetForm = () => {
        setEditId(null);
        setName('');
        setSlug('');
        setDescription('');
        setIsActive(1);
    };

    const handleSubmit = async () => {
        if (!name || !slug) {
            alert('Name and slug are required');
            return;
        }

        setLoading(true);

        const payload = {
            name,
            slug,
            description,
            is_active: isActive,
        };

        if (editId) {
            // UPDATE
            await fetch(`/api/admin/categories/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } else {
            // CREATE
            await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        }

        await fetchCategories();
        resetForm();
        setLoading(false);
    };

    const handleEdit = (cat) => {
        setEditId(cat.id);
        setName(cat.name);
        setSlug(cat.slug);
        setDescription(cat.description || '');
        setIsActive(cat.is_active);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (cat) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete the category "${cat.name}"?\n\nThis action cannot be undone.`
        );

        if (!confirmDelete) return;

        await fetch(`/api/admin/categories/${cat.id}`, {
            method: 'DELETE',
        });

        // If deleting the category currently being edited
        if (editId === cat.id) {
            resetForm();
        }

        fetchCategories();
    };

    return (
        <div className="space-y-8">

            {/* FORM */}
            <div className="bg-[#111827] p-6 rounded-xl">
                <h2 className="text-lg font-semibold mb-4">
                    {editId ? 'Update Category' : 'Create Category'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        placeholder="Category Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
                    />

                    <input
                        placeholder="Slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
                    />

                    <textarea
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded md:col-span-2"
                    />

                    <select
                        value={isActive}
                        onChange={(e) => setIsActive(Number(e.target.value))}
                        className="px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
                    >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>
                </div>

                <div className="mt-4 flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-cyan-400 text-black font-semibold rounded"
                    >
                        {loading
                            ? 'Saving...'
                            : editId
                                ? 'Update Category'
                                : 'Create Category'}
                    </button>

                    {editId && (
                        <button
                            onClick={resetForm}
                            className="px-6 py-2 bg-[#1f2937] text-gray-200 rounded"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-[#111827] p-6 rounded-xl">
                <h2 className="text-lg font-semibold mb-4">
                    Categories
                </h2>

                <table className="w-full text-sm">
                    <thead className="border-b border-gray-700 text-gray-400">
                        <tr>
                            <th className="py-2 text-left">Name</th>
                            <th className="py-2 text-left">Slug</th>
                            <th className="py-2 text-center">Status</th>
                            <th className="py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id} className="border-b border-gray-800">
                                <td className="py-2">{cat.name}</td>
                                <td className="py-2 text-gray-400">{cat.slug}</td>
                                <td className="py-2 text-center">
                                    {cat.is_active ? 'Active' : 'Inactive'}
                                </td>
                                <td className="py-2 text-center space-x-3">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="text-cyan-400 hover:underline"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(cat)}
                                        className="text-red-400 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
