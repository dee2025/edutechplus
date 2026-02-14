"use client";

import RecentReads from "@/components/profile/RecentReads";
import StreakCalendar from "@/components/profile/StreakCalendar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", avatar_url: "" });
  const [initialForm, setInitialForm] = useState(null);
  const [dirty, setDirty] = useState(false);
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // compute dirty state
    if (!initialForm) return setDirty(false);
    setDirty(JSON.stringify(form) !== JSON.stringify(initialForm));
  }, [form, initialForm]);

  function handleRemoveAvatar() {
    setForm((f) => ({ ...f, avatar_url: "" }));
    toast.success("Avatar cleared — remember to Save to persist");
  }
  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    const maxBytes = 3 * 1024 * 1024; // 3MB
    if (!allowed.includes(file.type)) {
      toast.error("Invalid file type. Use PNG, JPEG or WEBP.");
      return;
    }
    if (file.size > maxBytes) {
      toast.error("File too large (max 3MB)");
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function handleUpload() {
    doUploadWithXHR();
  }

  // cleanup preview url object to avoid leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // upload using an XHR so we can show progress (fetch doesn't have upload progress)
  function doUploadWithXHR() {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);

    const fd = new FormData();
    fd.append("avatar", selectedFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/auth/avatar");
    xhr.withCredentials = true;
    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const p = Math.round((e.loaded / e.total) * 100);
        setProgress(p);
      }
    };
    xhr.onload = function () {
      setUploading(false);
      if (xhr.status === 200) {
        try {
          const json = JSON.parse(xhr.responseText);
          if (json && json.secure_url) {
            setForm((f) => ({ ...f, avatar_url: json.secure_url }));
            setUser((u) => ({ ...u, avatar_url: json.secure_url }));
            toast.success("Avatar uploaded");
            setSelectedFile(null);
            setPreviewUrl(null);
            setProgress(0);
            // notify other components (Header) to refresh user data
            document.dispatchEvent(new Event("user-updated"));
            router.refresh();
          } else {
            toast.error("Upload failed");
          }
        } catch (err) {
          console.error(err);
          toast.error("Upload failed");
        }
      } else if (xhr.status === 413) {
        toast.error("File too large (max 3MB)");
      } else {
        const msg = xhr.responseText
          ? (() => {
              try {
                return JSON.parse(xhr.responseText).message;
              } catch (e) {
                return null;
              }
            })()
          : null;
        toast.error(msg || "Upload failed");
      }
    };
    xhr.onerror = function () {
      setUploading(false);
      toast.error("Upload failed");
    };
    xhr.send(fd);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/profile");
        if (!res.ok) return setUser(null);
        const json = await res.json();
        if (!json) return setUser(null);
        setUser(json);
        const f = { name: json.name || "", avatar_url: json.avatar_url || "" };
        setForm(f);
        setInitialForm(f);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <div className="p-6 bg-white dark:bg-[#0b0f19] min-h-screen">
        <div className="animate-pulse bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded p-6 max-w-3xl mx-auto">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded w-full" />
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="p-6 bg-white dark:bg-[#0b0f19] min-h-screen">
        <p className="text-gray-700 dark:text-gray-300">
          You need to be logged in to view this page.
        </p>
      </div>
    );

  async function handleSave(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Update failed");
        return;
      }
      setUser(json);
      const f2 = { name: json.name || "", avatar_url: json.avatar_url || "" };
      setInitialForm(f2);
      toast.success("Profile updated");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-white dark:bg-[#0b0f19] min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Your Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card */}
        <aside className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sticky top-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div
                className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden flex items-center justify-center cursor-pointer transition hover:scale-[1.02]"
                onClick={() => document.getElementById("avatar-input")?.click()}
                role="button"
                tabIndex={0}
              >
                {form.avatar_url ? (
                  <img
                    src={form.avatar_url}
                    alt={form.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-semibold text-gray-700 dark:text-gray-200">
                    {(form.name || user.email)[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Identity */}
              <div className="mt-4">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {form.name || "Unnamed User"}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>

              <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="mt-6 w-full space-y-2">
                <button
                  onClick={() =>
                    document.getElementById("avatar-input")?.click()
                  }
                  className="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-200 text-sm transition-colors"
                >
                  Change avatar
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(user.email);
                    toast.success("Email copied");
                  }}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-200 text-sm transition-colors"
                >
                  Copy email
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="lg:col-span-8 space-y-6">
          {/* Edit Profile */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <form onSubmit={handleSave} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                />
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Avatar
                </label>

                <input
                  id="avatar-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("avatar-input")?.click()
                    }
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-200 transition-colors"
                  >
                    Choose image
                  </button>

                  {form.avatar_url && !previewUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm text-white transition-colors"
                    >
                      Remove
                    </button>
                  )}

                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    PNG, JPG, WEBP · max 3MB
                  </span>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="mt-3 flex items-center gap-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-md object-cover border border-gray-300 dark:border-gray-700"
                    />

                    {!uploading && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleUpload}
                          className="px-3 py-1.5 bg-cyan-600 dark:bg-cyan-600 text-white rounded font-semibold text-sm transition-colors"
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress */}
                {uploading && (
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                      <div
                        className="h-full bg-cyan-600 dark:bg-cyan-400 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Uploading {progress}%
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!dirty}
                  className={`px-5 py-2 rounded font-semibold transition ${
                    dirty
                      ? "bg-cyan-600 dark:bg-cyan-600 text-white hover:bg-cyan-700 dark:hover:bg-cyan-700"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Save changes
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>

                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {dirty ? "Unsaved changes" : "No changes"}
                </span>
              </div>
            </form>
          </div>

          {/* Streak */}
          <div className="mt-6 w-full overflow-x-auto">
            <StreakCalendar days={180} />
          </div>
          {/* Recent Reads */}
          <RecentReads max={10} />
        </section>
      </div>
    </div>
  );
}
