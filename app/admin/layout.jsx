import EmailStatusBanner from "@/components/admin/EmailStatusBanner";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export default function AdminLayout({ children }) {
  return (
    <>
      <style>{`
        /* Custom scrollbar styling for admin panel */
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 197, 94, 0.5) transparent;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(6, 182, 212, 0.6) 0%, rgba(34, 197, 94, 0.6) 100%);
          border-radius: 10px;
          border: 2px solid rgba(15, 23, 42, 0.5);
          background-clip: content-box;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(6, 182, 212, 0.8) 0%, rgba(34, 197, 94, 0.8) 100%);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, rgba(6, 182, 212, 1) 0%, rgba(34, 197, 94, 1) 100%);
        }
      `}</style>

      <div className="h-screen flex bg-gradient-to-br from-[#0a0d14] via-[#0b0f19] to-[#0f131b] text-gray-200 overflow-hidden">
        {/* Animated background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -right-1/2 w-full h-full bg-gradient-to-bl from-cyan-950/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 left-1/4 w-full h-full bg-gradient-to-tr from-blue-950/10 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Sticky Sidebar - No scroll on wrapper, only on nav */}
        <div className="sticky top-0 h-screen flex flex-col">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky Header */}
          <div className="sticky top-0 z-40">
            <Topbar />
            <EmailStatusBanner />
          </div>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </>
  );
}
