import StatsCard from '@/components/admin/StatsCard';

export default function DashboardPage() {
    return (
        <div className="space-y-8">

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard title="Total Articles" value="128" />
                <StatsCard title="Published" value="94" />
                <StatsCard title="Categories" value="12" />
                <StatsCard title="Views Today" value="8,432" />
            </div>

            {/* Quick Actions */}
            <div className="bg-[#111827] rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">
                    Quick Actions
                </h2>

                <div className="flex flex-wrap gap-4">
                    <button className="px-4 py-2 rounded bg-cyan-400 text-black font-semibold">
                        + New Article
                    </button>
                    <button className="px-4 py-2 rounded bg-[#1f2937] text-gray-200">
                        Manage Categories
                    </button>
                </div>
            </div>

        </div>
    );
}
