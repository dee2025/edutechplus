export default function Newsletter() {
    return (
        <section className="bg-[#111827] py-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h3 className="text-2xl font-bold text-gray-100">
                    Stay Ahead of the Tech Curve
                </h3>
                <p className="mt-3 text-gray-400">
                    Weekly insights on AI, tech, and education — no spam.
                </p>

                <div className="mt-6 flex justify-center gap-3 flex-wrap">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="px-4 py-2 rounded-md bg-[#0b0f19] text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <button className="px-6 py-2 rounded-md bg-cyan-400 text-black font-semibold hover:bg-cyan-300">
                        Subscribe
                    </button>
                </div>
            </div>
        </section>
    );
}
