'use client';

import { useState } from 'react';

export default function AdminForm({ initialData = {}, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'editor',
        is_active: 1,
        ...initialData,
    });

    const handleSubmit = () => {
        if (!form.name || !form.email) {
            alert('Name and email are required');
            return;
        }

        // password optional on update
        if (initialData.id && !form.password) {
            delete form.password;
        }

        onSubmit(form);
    };

    return (
        <div className="space-y-4">

            <input
                placeholder="Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
            />

            <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
            />

            <input
                type="password"
                placeholder={initialData.id ? 'New password (optional)' : 'Password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
            />

            <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded w-full"
            >
                <option value="editor">Editor</option>
                <option value="super_admin">Super Admin</option>
            </select>

            <select
                value={form.is_active}
                onChange={e => setForm({ ...form, is_active: Number(e.target.value) })}
                className="px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded w-full"
            >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
            </select>

            <div className="flex gap-3">
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-cyan-400 text-black rounded font-semibold"
                >
                    Save Admin
                </button>

                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 bg-[#1f2937] text-gray-200 rounded"
                    >
                        Cancel
                    </button>
                )}
            </div>

        </div>
    );
}
