import Link from 'next/link';

const menu = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Articles', path: '/admin/articles' },
    { name: 'Categories', path: '/admin/categories' },
    { name: 'Homepage', path: '/admin/homepage' },
    { name: 'Admins', path: '/admin/admins' },
];

export default function Sidebar() {
    return (
        <aside className="w-64 bg-[#111827] border-r border-gray-800 hidden md:flex flex-col">
            <div className="px-6 py-5 border-b border-gray-800">
                <span className="text-xl font-bold">
                    EduTech<span className="text-cyan-400">+</span>
                </span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menu.map(item => (
                    <Link
                        key={item.name}
                        href={item.path}
                        className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#1f2937] hover:text-white"
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="px-4 py-4 border-t border-gray-800 text-sm text-gray-500">
                Admin Panel
            </div>
        </aside>
    );
}
