// "use client";

// import { usePathname } from "next/navigation";
// import Header from "@/components/Common/Header";
// import Footer from "@/components/Common/Footer";

// export default function ClientLayoutWrapper({ children }) {
//   const pathname = usePathname();
//   const isAdmin = pathname.startsWith("/admin");
//   const isAITutor = pathname.startsWith("/ai-tutor"); 

//   return (
//     <>
//       {!isAdmin && !isAITutor && <Header />}
//       <div className="bg-[#0b0f19]">

//       {children}
//       </div>
//       {!isAdmin && !isAITutor && <Footer />}
//     </>
//   );
// }


"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Common/Header";
import Footer from "@/components/Common/Footer";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");
  const isAITutor = pathname.startsWith("/ai-tutor");

  return (
    <>
      {!isAdmin && !isAITutor && <Header />}

      <div className="bg-[#0b0f19] relative">
        {children}

        {/* 🔥 ABSOLUTE AI TUTOR BUTTON */}
        {!isAdmin && !isAITutor && (
          <Link
            href="/ai-tutor"
            className="
              fixed bottom-6 right-6 z-50
              bg-gradient-to-r from-blue-600 to-indigo-600
              text-white px-5 py-3 rounded-full
              shadow-lg text-sm font-medium
              hover:scale-105 hover:shadow-xl
              transition-transform duration-200
            "
          >
            🧠 AI Tutor
          </Link>
        )}
      </div>

      {!isAdmin && !isAITutor && <Footer />}
    </>
  );
}
