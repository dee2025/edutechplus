"use client";

import {
  ArrowUpDown,
  Calendar,
  CheckCircle,
  Mail,
  RefreshCcw,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, inactive
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [sortBy, setSortBy] = useState("created_at"); // created_at, name, email, status
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [selectedUser, setSelectedUser] = useState(null);
  const isMounted = useRef(true);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      if (isMounted.current) {
        setUsers(data || []);
        setLoading(false);
      }
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  }

  useEffect(() => {
    isMounted.current = true;
    fetchUsers();
    return () => {
      isMounted.current = false;
    };
  }, []);

  async function handleToggleStatus(userId, currentStatus) {
    setToggling(userId);
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          is_active: currentStatus === 1 ? 0 : 1,
        }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, is_active: currentStatus === 1 ? 0 : 1 }
              : u,
          ),
        );
      }
    } catch (e) {
      console.error("Error toggling user status:", e);
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(userId) {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    )
      return;

    setDeleting(userId);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (e) {
      console.error("Error deleting user:", e);
    } finally {
      setDeleting(null);
    }
  }

  const filteredUsers = users
    .filter((user) => {
      if (filter === "active") return user.is_active === 1;
      if (filter === "inactive") return user.is_active === 0;
      return true;
    })
    .filter((user) => {
      const searchLower = search.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "created_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-300 to-violet-500 bg-clip-text text-transparent">
            Users Management
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Manage all user accounts and control access
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-medium transition-all duration-200 hover:shadow-lg shadow-violet-500/20"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border border-emerald-500/20 p-5 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400 font-medium uppercase tracking-wide">
                Active Users
              </p>
              <p className="text-3xl font-bold text-emerald-300 mt-2">
                {users.filter((u) => u.is_active === 1).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-amber-900/30 to-amber-950/30 border border-amber-500/20 p-5 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-400 font-medium uppercase tracking-wide">
                Inactive Users
              </p>
              <p className="text-3xl font-bold text-amber-300 mt-2">
                {users.filter((u) => u.is_active === 0).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <XCircle size={24} className="text-amber-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-violet-900/30 to-violet-950/30 border border-violet-500/20 p-5 hover:border-violet-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-violet-400 font-medium uppercase tracking-wide">
                Total Users
              </p>
              <p className="text-3xl font-bold text-violet-300 mt-2">
                {users.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Users size={24} className="text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 rounded-2xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50 p-5 backdrop-blur-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all", label: "All Users", color: "violet" },
              { value: "active", label: "Active", color: "emerald" },
              { value: "inactive", label: "Inactive", color: "amber" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  filter === tab.value
                    ? `bg-${tab.color}-500/30 text-${tab.color}-300 ring-1 ring-${tab.color}-500/50`
                    : "bg-gray-700/30 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="md:ml-auto flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="created_at">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="is_active">Sort by Status</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-all"
              title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              <ArrowUpDown size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-gray-700/50 overflow-hidden">
        {loading ? (
          <div className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-center">
            <Users
              size={48}
              className="mx-auto text-gray-600 mb-4 opacity-50"
            />
            <p className="text-gray-400 text-lg font-medium">No users found</p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your search filters or criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-gradient-to-r from-gray-800/20 to-gray-900/20 hover:from-gray-800/40 hover:to-gray-900/40 transition-colors duration-200 group"
                  >
                    {/* User Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white truncate">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail
                          size={14}
                          className="text-gray-500 flex-shrink-0"
                        />
                        <span className="text-sm truncate">{user.email}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {user.is_active === 1 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar size={14} />
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() =>
                            handleToggleStatus(user.id, user.is_active)
                          }
                          disabled={toggling === user.id}
                          title={
                            user.is_active === 1
                              ? "Deactivate user"
                              : "Activate user"
                          }
                          className={`p-2 rounded-lg transition-all ${
                            user.is_active === 1
                              ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          } disabled:opacity-50`}
                        >
                          {user.is_active === 1 ? (
                            <XCircle size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deleting === user.id}
                          title="Delete user"
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {!loading && filteredUsers.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-400 px-2">
          <span>
            Showing {filteredUsers.length} of {users.length} users
          </span>
          <span>
            {Math.round(
              (users.filter((u) => u.is_active === 1).length / users.length) *
                100 || 0,
            )}
            % active
          </span>
        </div>
      )}
    </div>
  );
}
