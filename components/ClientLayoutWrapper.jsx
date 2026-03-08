"use client";

import Footer from "@/components/Common/Footer";
import Header from "@/components/Common/Header";
import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}

      <div className="bg-white dark:bg-[#0b0f19] relative transition-colors">
        {children}
      </div>

      {!isAdmin && <Footer />}
    </>
  );
}
