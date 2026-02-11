"use client";

import AdminForm from "@/components/admin/AdminForm";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [editAdmin, setEditAdmin] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchAdmins = async () => {
    const res = await fetch("/api/admin/admins");
    const data = await res.json();
    setAdmins(data);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (data) => {
    try {
      await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("Admin created successfully");
      setShowForm(false);
      fetchAdmins();
    } catch (error) {
      toast.error("Failed to create admin");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await fetch(`/api/admin/admins/${editAdmin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("Admin updated successfully");
      setEditAdmin(null);
      setShowForm(false);
      fetchAdmins();
    } catch (error) {
      toast.error("Failed to update admin");
    }
  };

  const handleDelete = async (admin) => {
    toast((t) => (
      <div className="space-y-3">
        <p className="text-sm">
          Delete <b>{admin.name}</b>? This cannot be undone.
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
              try {
                const res = await fetch(`/api/admin/admins/${admin.id}`, {
                  method: "DELETE",
                });
                const result = await res.json();
                if (!res.ok) {
                  toast.error(result.message || "Failed to delete admin");
                  return;
                }
                toast.success("Admin deleted successfully");
                fetchAdmins();
              } catch (error) {
                toast.error("Failed to delete admin");
              }
            }}
            className="px-3 py-1 text-sm bg-red-500 text-black rounded"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  const handleCancel = () => {
    setEditAdmin(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admins</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage super admins and editors for your platform
          </p>
        </div>

        <button
          onClick={() => {
            setEditAdmin(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition"
        >
          + Add Admin
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-[#111827] border border-gray-700 p-8 rounded-xl">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            {editAdmin ? "Edit Admin" : "Create New Admin"}
          </h2>

          <AdminForm
            initialData={editAdmin || {}}
            onSubmit={editAdmin ? handleUpdate : handleCreate}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* TABLE */}
      <div className="bg-[#111827] border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0b0f19] border-b border-gray-700">
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Name
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Email
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Role
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-300">
                  Status
                </th>
                <th className="px-6 py-4 text-right font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-[#1a1f2e] transition">
                  <td className="px-6 py-4 font-medium text-white">
                    {admin.name}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-medium rounded ${
                        admin.role === "super_admin"
                          ? "bg-red-900/40 text-red-300"
                          : "bg-blue-900/40 text-blue-300"
                      }`}
                    >
                      {admin.role === "super_admin" ? "Super Admin" : "Editor"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-medium rounded ${
                        admin.is_active
                          ? "bg-green-900/40 text-green-300"
                          : "bg-red-900/40 text-red-300"
                      }`}
                    >
                      {admin.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditAdmin(admin);
                          setShowForm(true);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 transition"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(admin)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {admins.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400">No admins created yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition"
            >
              Create your first admin →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
