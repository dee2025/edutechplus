import Link from 'next/link';

const topics = [
    'Artificial Intelligence',
    'Programming',
    'Startups',
    'Cybersecurity',
    'Gadgets',
    'Space Tech',
    'EdTech',
];

export default function TrendingTopics() {
    return (
        <section className="bg-[#0b0f19] border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4 overflow-x-auto">
                <span className="text-sm font-semibold text-gray-400 whitespace-nowrap">
                    Trending:
                </span>

                {topics.map((topic) => (
                    <Link
                        key={topic}
                        href={`/${topic.toLowerCase().replace(/\s/g, '-')}`}
                        className="px-4 py-1.5 rounded-full text-sm bg-[#111827] text-gray-300 hover:bg-cyan-400 hover:text-black transition whitespace-nowrap"
                    >
                        {topic}
                    </Link>
                ))}
            </div>
        </section>
    );
}
