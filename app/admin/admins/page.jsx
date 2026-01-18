'use client';

import { useEffect, useState } from 'react';
import AdminForm from '@/components/admin/AdminForm';

export default function AdminsPage() {
    const [admins, setAdmins] = useState([]);
    const [editAdmin, setEditAdmin] = useState(null);

    const fetchAdmins = async () => {
        const res = await fetch('/api/admin/admins');
        const data = await res.json();
        setAdmins(data);
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleCreate = async (data) => {
        await fetch('/api/admin/admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        fetchAdmins();
    };

    const handleUpdate = async (data) => {
        await fetch(`/api/admin/admins/${editAdmin.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        setEditAdmin(null);
        fetchAdmins();
    };

    const handleDelete = async (admin) => {
        if (!confirm(`Delete admin "${admin.name}"?`)) return;

        const res = await fetch(`/api/admin/admins/${admin.id}`, {
            method: 'DELETE',
        });

        const result = await res.json();
        if (!res.ok) {
            alert(result.message);
            return;
        }

        fetchAdmins();
    };

    return (
        <div className="space-y-8">

            {/* FORM */}
            <div className="bg-[#111827] p-6 rounded-xl">
                <h2 className="text-lg font-semibold mb-4">
                    {editAdmin ? 'Edit Admin' : 'Create Admin'}
                </h2>

                <AdminForm
                    initialData={editAdmin || {}}
                    onSubmit={editAdmin ? handleUpdate : handleCreate}
                    onCancel={() => setEditAdmin(null)}
                />
            </div>

            {/* LIST */}
            <div className="bg-[#111827] p-6 rounded-xl">
                <h2 className="text-lg font-semibold mb-4">Admins</h2>

                <table className="w-full text-sm">
                    <thead className="border-b border-gray-700 text-gray-400">
                        <tr>
                            <th className="text-left py-2">Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => (
                            <tr key={admin.id} className="border-b border-gray-800">
                                <td className="py-2">{admin.name}</td>
                                <td className="text-center">{admin.email}</td>
                                <td className="text-center">{admin.role}</td>
                                <td className="text-center">
                                    {admin.is_active ? 'Active' : 'Inactive'}
                                </td>
                                <td className="text-center space-x-4">
                                    <button
                                        onClick={() => setEditAdmin(admin)}
                                        className="text-cyan-400"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(admin)}
                                        className="text-red-400"
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
