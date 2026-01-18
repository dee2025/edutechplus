'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // UI state
    const [showForm, setShowForm] = useState(false);

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
        setShowForm(false);
    };

    const handleSubmit = async () => {
        if (!name || !slug) {
            toast.error('Name and slug are required');
            return;
        }

        setLoading(true);

        const payload = {
            name,
            slug,
            description,
            is_active: isActive,
        };

        try {
            if (editId) {
                await fetch(`/api/admin/categories/${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                toast.success('Category updated');
            } else {
                await fetch('/api/admin/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                toast.success('Category created');
            }

            await fetchCategories();
            resetForm();
        } catch {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cat) => {
        setEditId(cat.id);
        setName(cat.name);
        setSlug(cat.slug);
        setDescription(cat.description || '');
        setIsActive(cat.is_active);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (cat) => {
        toast((t) => (
            <div className="space-y-3">
                <p className="text-sm">
                    Delete <b>{cat.name}</b>? This cannot be undone.
                </p>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 text-sm bg-gray-300 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await fetch(`/api/admin/categories/${cat.id}`, {
                                method: 'DELETE',
                            });

                            if (editId === cat.id) resetForm();
                            fetchCategories();
                            toast.success('Category deleted');
                        }}
                        className="px-3 py-1 text-sm bg-red-500 text-black rounded"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ));
    };

    return (
        <div className="space-y-8">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Categories</h1>

                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black font-semibold rounded"
                >
                    <Plus size={16} />
                    Add Category
                </button>
            </div>

            {/* FORM (HIDDEN BY DEFAULT) */}
            {showForm && (
                <div className="bg-[#111827] p-6 rounded-xl relative">
                    <button
                        onClick={resetForm}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        <X size={18} />
                    </button>

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
                            {loading ? 'Saving...' : editId ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            )}

            {/* TABLE */}
            <div className="bg-[#111827] p-6 rounded-xl">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-700 text-gray-400">
                        <tr>
                            <th className="py-3 text-left">Name</th>
                            <th className="py-3 text-left">Slug</th>
                            <th className="py-3 text-center">Status</th>
                            <th className="py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr
                                key={cat.id}
                                className="border-b border-gray-800 hover:bg-[#0b0f19]"
                            >
                                <td className="py-3">{cat.name}</td>
                                <td className="py-3 text-gray-400">{cat.slug}</td>
                                <td className="py-3 text-center">
                                    {cat.is_active ? 'Active' : 'Inactive'}
                                </td>
                                <td className="py-3 text-right flex justify-end gap-3">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="text-cyan-400 hover:text-cyan-300"
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(cat)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <Trash2 size={16} />
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
