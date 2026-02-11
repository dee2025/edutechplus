"use client";

import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // UI state
  const [showForm, setShowForm] = useState(false);

  // form state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(1);
  const [parentId, setParentId] = useState(null);

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setSlug("");
    setDescription("");
    setIsActive(1);
    setParentId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!name || !slug) {
      toast.error("Name and slug are required");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      slug,
      description,
      is_active: isActive,
      parent_id: parentId,
    };

    try {
      if (editId) {
        await fetch(`/api/admin/categories/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Category updated");
      } else {
        await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Category created");
      }

      await fetchCategories();
      resetForm();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setIsActive(cat.is_active);
    setParentId(cat.parent_id || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
                method: "DELETE",
              });

              if (editId === cat.id) resetForm();
              fetchCategories();
              toast.success("Category deleted");
            }}
            className="px-3 py-1 text-sm bg-red-500 text-black rounded"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  // Get only main categories for parent selection
  const mainCategories = categories.filter((cat) => !cat.parent_id);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage main categories and subcategories for your articles
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-[#111827] p-8 rounded-xl border border-gray-700 relative">
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-semibold mb-6 text-white">
            {editId ? "Edit Category" : "Create New Category"}
          </h2>

          <div className="space-y-5">
            {/* Row 1: Name and Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  placeholder="e.g., Technology, Science, Business"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0b0f19] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug *
                </label>
                <input
                  placeholder="e.g., technology, science, business"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0b0f19] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>

            {/* Row 2: Parent Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Parent Category (Optional)
              </label>
              <select
                value={parentId || ""}
                onChange={(e) =>
                  setParentId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full px-4 py-2.5 bg-[#0b0f19] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition"
              >
                <option value="">-- Main Category (No Parent) --</option>
                {mainCategories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    disabled={editId === cat.id}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to make this a main category
              </p>
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                placeholder="Add a detailed description for this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-2.5 bg-[#0b0f19] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition resize-none"
              />
            </div>

            {/* Row 4: Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={1}
                    checked={isActive === 1}
                    onChange={(e) => setIsActive(Number(e.target.value))}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={0}
                    checked={isActive === 0}
                    onChange={(e) => setIsActive(Number(e.target.value))}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">Inactive</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Saving..."
                  : editId
                    ? "Update Category"
                    : "Create Category"}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2.5 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
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
                  Slug
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Type
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
              {mainCategories.map((cat) => (
                <React.Fragment key={cat.id}>
                  {/* Main Category Row */}
                  <tr className="hover:bg-[#1a1f2e] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedCategories);
                              if (newExpanded.has(cat.id)) {
                                newExpanded.delete(cat.id);
                              } else {
                                newExpanded.add(cat.id);
                              }
                              setExpandedCategories(newExpanded);
                            }}
                            className="text-gray-500 hover:text-gray-300 transition"
                          >
                            {expandedCategories.has(cat.id) ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </button>
                        )}
                        {!cat.subcategories ||
                        cat.subcategories.length === 0 ? (
                          <span className="w-6" />
                        ) : null}
                        <span className="font-medium text-white">
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{cat.slug}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-medium bg-purple-900/40 text-purple-300 rounded">
                        Main
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded ${
                          cat.is_active
                            ? "bg-green-900/40 text-green-300"
                            : "bg-red-900/40 text-red-300"
                        }`}
                      >
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setEditId(null);
                            setName("");
                            setSlug("");
                            setDescription("");
                            setIsActive(1);
                            setParentId(cat.id);
                            setShowForm(true);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          title="Add Subcategory"
                          className="text-green-400 hover:text-green-300 transition"
                        >
                          <Plus size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(cat)}
                          className="text-cyan-400 hover:text-cyan-300 transition"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Subcategories */}
                  {expandedCategories.has(cat.id) &&
                    cat.subcategories &&
                    cat.subcategories.map((subcat) => (
                      <tr
                        key={subcat.id}
                        className="bg-[#0b0f19]/50 hover:bg-[#1a1f2e]/50 transition"
                      >
                        <td className="px-6 py-4 pl-16">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">→</span>
                            <span className="text-gray-200">{subcat.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {subcat.slug}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-2.5 py-1 text-xs font-medium bg-blue-900/40 text-blue-300 rounded">
                            Subcategory
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 text-xs font-medium rounded ${
                              subcat.is_active
                                ? "bg-green-900/40 text-green-300"
                                : "bg-red-900/40 text-red-300"
                            }`}
                          >
                            {subcat.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleEdit(subcat)}
                              className="text-cyan-400 hover:text-cyan-300 transition"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(subcat)}
                              className="text-red-400 hover:text-red-300 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {mainCategories.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400">No categories created yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition"
            >
              Create your first category →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
