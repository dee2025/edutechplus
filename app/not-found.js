import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="min-h-[80vh] bg-[#0b0f19] flex items-center justify-center px-4">
            <div className="text-center max-w-md">

                <h1 className="text-7xl font-bold text-cyan-400">
                    404
                </h1>

                <h2 className="mt-4 text-2xl font-semibold text-gray-100">
                    Page not found
                </h2>

                <p className="mt-3 text-gray-400">
                    The page you’re looking for doesn’t exist or may have been moved.
                </p>

                <div className="mt-6 flex justify-center gap-4">
                    <Link
                        href="/"
                        className="px-6 py-2 rounded bg-cyan-400 text-black font-semibold hover:bg-cyan-300"
                    >
                        Go Home
                    </Link>

                    <Link
                        href="/articles"
                        className="px-6 py-2 rounded border border-gray-700 text-gray-300 hover:bg-[#111827]"
                    >
                        Browse Articles
                    </Link>
                </div>
            </div>
        </main>
    );
}
