export default function StatsCard({ title, value }) {
    return (
        <div className="bg-[#111827] rounded-xl p-5">
            <p className="text-sm text-gray-400">
                {title}
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
                {value}
            </p>
        </div>
    );
}
