"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectToMyProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/auth/login");
          return;
        }
        const user = await res.json();
        const username = user?.username || user?.user_slug || user?.id;
        if (!username) {
          router.replace("/auth/login");
          return;
        }
        router.replace(`/${username}`);
      } catch {
        router.replace("/auth/login");
      }
    }

    redirectToMyProfile();
  }, [router]);

  return null;
}
