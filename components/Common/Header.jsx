"use client";

import ThemeToggle from "@/components/ThemeToggle";
import AuthModal from "@/components/UserAuth/AuthModal";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const Header = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const profileRef = useRef(null);
  const { data: session } = useSession();

  useEffect(() => {
    // Load user data when session is available
    async function loadUserData() {
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const json = await res.json();
            setUser(json);
          }
        } catch (err) {
          console.error("Failed to load user data:", err);
        }
      } else {
        setUser(null);
      }
    }

    loadUserData();

    function onDocClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    // listen for profile/avatar updates from other pages (e.g., profile upload)
    document.addEventListener("click", onDocClick);
    document.addEventListener("user-updated", loadUserData);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("user-updated", loadUserData);
    };
  }, [session]);

  async function handleLogout() {
    await signOut({ redirect: false });
    setUser(null);
    router.push("/");
  }

  function avatarInitials(name) {
    if (!name) return "U";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0b0f19] border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo + Menu */}
          <div className="flex items-center gap-4">
            <Link href="/" className="font-mono text-2xl font-semibold">
              <span className="text-gray-900 dark:text-gray-200">edutech</span>
              <span className="text-cyan-500 dark:text-cyan-400">+</span>
            </Link>
          </div>

          {/* Center: Search */}
          {/* <div className="hidden md:flex flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search global tech news..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#111827] text-gray-900 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
            />
          </div> */}
          {/* <div className="hidden md:flex flex-1 max-w-xl items-center justify-center gap-6">
            <Link
              href="/ai-tutor"
              className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:opacity-80"
            >
              Your Tutor
            </Link>
            <Link
              href="/roadmaps"
              className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:opacity-80"
            >
              Roadmaps
            </Link>
            <Link
              href="/latest-articles"
              className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:opacity-80"
            >
              Latest Updates →
            </Link>
          </div> */}

          {/* Right: CTA */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="flex items-center gap-4">
              {/* Auth / Profile */}
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-[#111827] border border-gray-300 dark:border-gray-700 overflow-hidden"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-gray-200">
                        {avatarInitials(user.name)}
                      </span>
                    )}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#0b0f19] border border-gray-300 dark:border-gray-800 rounded shadow z-50">
                      <Link
                        href="/profile"
                        className="block px-3 py-2 text-sm text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#111827]"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#111827]"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowAuth(true)}
                    className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black font-semibold transition-colors"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={async () => {
            setShowAuth(false);
            try {
              const res = await fetch("/api/auth/me");
              if (!res.ok) return;
              const json = await res.json();
              setUser(json);
              router.refresh();
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}
    </header>
  );
};

export default Header;
