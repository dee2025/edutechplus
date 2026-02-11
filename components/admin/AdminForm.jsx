"use client";

import { useState } from "react";

export default function AdminForm({ initialData = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor",
    is_active: 1,
    ...initialData,
  });

  const handleSubmit = () => {
    if (!form.name || !form.email) {
      alert("Name and email are required");
      return;
    }

    // password optional on update
    if (initialData.id && !form.password) {
      delete form.password;
    }

    onSubmit(form);
  };

  return (
    <div className="space-y-5">
      {/* Row 1: Name and Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            placeholder="e.g., John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0b0f19] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            placeholder="e.g., john@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0b0f19] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>
      </div>

      {/* Row 2: Password */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {initialData.id ? "New Password (Optional)" : "Password *"}
        </label>
        <input
          type="password"
          placeholder={
            initialData.id
              ? "Leave blank to keep current password"
              : "Enter a strong password"
          }
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-4 py-2.5 bg-[#0b0f19] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
        />
      </div>

      {/* Row 3: Role and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Role
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0b0f19] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition"
          >
            <option value="editor">Editor</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <div className="flex gap-4 pt-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={1}
                checked={form.is_active === 1}
                onChange={(e) =>
                  setForm({ ...form, is_active: Number(e.target.value) })
                }
                className="cursor-pointer"
              />
              <span className="text-sm text-gray-300">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={0}
                checked={form.is_active === 0}
                onChange={(e) =>
                  setForm({ ...form, is_active: Number(e.target.value) })
                }
                className="cursor-pointer"
              />
              <span className="text-sm text-gray-300">Inactive</span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition"
        >
          {initialData.id ? "Update Admin" : "Create Admin"}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
