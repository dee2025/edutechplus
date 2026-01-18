'use client';

import { useRouter } from 'next/navigation';

export default function Topbar() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/admin/logout', {
            method: 'POST',
        });

        // Redirect to login
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <header className="h-16 bg-[#0b0f19] border-b border-gray-800 flex items-center justify-between px-6">
            <h1 className="text-lg font-semibold">
                Dashboard
            </h1>

            <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">Admin</span>
                <button
                    onClick={handleLogout}
                    className="px-3 py-1 rounded bg-[#111827] hover:bg-[#1f2937]"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}
