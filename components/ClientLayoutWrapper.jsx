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

import Footer from "@/components/Common/Footer";
import Header from "@/components/Common/Header";
import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");
  const isAITutor = pathname.startsWith("/ai-tutor");

  return (
    <>
      {!isAdmin && !isAITutor && <Header />}

      <div className="bg-white dark:bg-[#0b0f19] relative transition-colors">
        {children}

        {/* 🔥 ABSOLUTE AI TUTOR BUTTON */}
      </div>

      {!isAdmin && !isAITutor && <Footer />}
    </>
  );
}
