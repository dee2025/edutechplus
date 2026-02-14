"use client";

import RecentReads from "@/components/profile/RecentReads";
import StreakCalendar from "@/components/profile/StreakCalendar";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();

  useEffect(() => {
    // If still loading, don't redirect yet
    if (status === "loading") {
      return;
    }

    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    // Load user data when session is available
    if (status === "authenticated" && session?.user) {
      loadUserData();
    }
  }, [status, session, router]);

  async function loadUserData() {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setUser(json);
      setForm({ name: json.name || "", avatar_url: json.avatar_url || "" });
      setInitialForm({
        name: json.name || "",
        avatar_url: json.avatar_url || "",
      });
      setLoading(false);
    } catch (err) {
      console.error("Failed to load user:", err);
      setUser(null);
      setLoading(false);
    }
  }

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

  if (loading || status === "loading") {
    return (
      <div className="p-6 bg-white dark:bg-[#0b0f19] min-h-screen">
        <div className="animate-pulse bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded p-6 max-w-3xl mx-auto">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-white dark:bg-[#0b0f19] min-h-screen">
        <p className="text-gray-700 dark:text-gray-300">
          You need to be logged in to view this page.
        </p>
      </div>
    );
  }

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

  // Show loading screen while checking session
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0f19]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
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

          {/* Connected Accounts */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Connected Accounts
            </h2>

            <div className="space-y-3">
              {/* Email Verification Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Email Address
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {user?.email_verified ? (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full">
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              {/* Google Connection Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Google Account
                  </span>
                </div>
                <div>
                  {user?.provider === "google" ? (
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                      ✓ Connected
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      Not Connected
                    </span>
                  )}
                </div>
              </div>
            </div>
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
