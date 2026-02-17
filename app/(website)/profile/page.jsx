"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const router = useRouter();
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

    // Redirect to dynamic profile page when session is available
    if (status === "authenticated" && session?.user) {
      fetchUserSlug();
    }
  }, [status, session, router]);

  async function fetchUserSlug() {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/auth/login");
        return;
      }
      const user = await res.json();
      const slug = user.username || user.user_slug || user.id;
      router.push(`/profile/${slug}`);
    } catch (err) {
      console.error("Failed to load user:", err);
      router.push("/auth/login");
    }
  }

  // Show loading screen while checking session and redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-black">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Loading your profile...
        </p>
      </div>
    </div>
  );
}
