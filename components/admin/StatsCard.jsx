export default function StatsCard({ title, value, icon: Icon }) {
    return (
        <div className="bg-[#111827] rounded-xl p-4 flex items-center gap-4">
            {Icon && (
                <div className="p-2 rounded-lg bg-[#0b0f19] text-cyan-400">
                    <Icon size={18} />
                </div>
            )}

            <div>
                <p className="text-xs text-gray-400">
                    {title}
                </p>
                <p className="text-xl font-bold text-white leading-tight">
                    {value}
                </p>
            </div>
        </div>
    );
}
