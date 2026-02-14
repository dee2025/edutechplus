"use client";

import ThemeToggle from "@/components/ThemeToggle";
import AuthModal from "@/components/UserAuth/AuthModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const profileRef = useRef(null);

  useEffect(() => {
    // load current user
    async function load() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return setUser(null);
        const json = await res.json();
        setUser(json);
      } catch (err) {
        setUser(null);
      }
    }
    load();

    function onDocClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    // listen for profile/avatar updates from other pages (e.g., profile upload)
    document.addEventListener("click", onDocClick);
    document.addEventListener("user-updated", load);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("user-updated", load);
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
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

  const menuItems = [
    { name: "AI", path: "/ai" },
    { name: "GADGETS", path: "/gadgets" },
    { name: "STARTUPS", path: "/startups" },
    { name: "CYBERSECURITY", path: "/cyber-security" },
    { name: "SPACE", path: "/space" },
    { name: "PROGRAMMING", path: "/programming" },
    { name: "REVIEWS", path: "/reviews" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0b0f19] border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo + Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden text-gray-700 dark:text-gray-300 text-2xl"
            >
              ☰
            </button>

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
              className="w-full px-4 py-2 rounded-full bg-[#111827] text-gray-200 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div> */}
          <div className="hidden md:flex flex-1 max-w-xl items-center justify-center gap-6">
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
          </div>

          {/* Right: CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

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

        {/* Category Pills */}
        {/* <div className="hidden lg:flex gap-3 mt-5 overflow-x-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#111827] text-gray-300 hover:bg-cyan-400 hover:text-black transition"
            >
              {item.name}
            </Link>
          ))}
        </div> */}
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden bg-white dark:bg-[#0b0f19] border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setOpen(false)}
              className="block text-gray-700 dark:text-gray-300 text-sm font-semibold hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              {item.name}
            </Link>
          ))}

          <input
            type="text"
            placeholder="Search..."
            className="w-full mt-3 px-4 py-2 rounded-md bg-gray-100 dark:bg-[#111827] text-gray-900 dark:text-gray-200 placeholder-gray-500 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
          />
        </div>
      )}

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
