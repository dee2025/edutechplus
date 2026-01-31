"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Common/Header";
import Footer from "@/components/Common/Footer";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      <div className="bg-[#0b0f19]">

      {children}
      </div>
      {!isAdmin && <Footer />}
    </>
  );
}
