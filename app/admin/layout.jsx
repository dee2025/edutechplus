import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import EmailStatusBanner from '@/components/admin/EmailStatusBanner';

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen flex bg-[#0b0f19] text-gray-200">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Topbar />
                <EmailStatusBanner />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
