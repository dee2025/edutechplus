import StatsCard from "@/components/admin/StatsCard";
import Link from "next/link";
import {
    FileText,
    CheckCircle,
    Layers,
    Eye,
    Plus,
    Folder,
} from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-6">

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Articles"
                    value="128"
                    icon={FileText}
                />
                <StatsCard
                    title="Published"
                    value="94"
                    icon={CheckCircle}
                />
                <StatsCard
                    title="Categories"
                    value="12"
                    icon={Layers}
                />
                <StatsCard
                    title="Views Today"
                    value="8,432"
                    icon={Eye}
                />
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-[#111827] rounded-xl p-4">
                <h2 className="text-sm font-semibold text-gray-300 mb-3">
                    Quick Actions
                </h2>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/admin/articles/create"
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded bg-cyan-400 text-black font-semibold"
                    >
                        <Plus size={16} />
                        New Article
                    </Link>

                    <Link
                        href="/admin/categories"
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded bg-[#1f2937] text-gray-200"
                    >
                        <Folder size={16} />
                        Manage Categories
                    </Link>
                </div>
            </div>

        </div>
    );
}
