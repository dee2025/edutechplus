"use client";

export default function ThreeColumnPage() {
    const scienceArticles = [
        { image: "/images/homepage/science-1.jpg", title: "The way AI is shaking up the healthcare system of the world", date: "2025-12-03", category: "SCIENCE" },
        { image: "/images/homepage/science-2.jpg", title: "Quantum Computing Breakthrough Changes Everything", date: "2025-12-02", category: "SCIENCE" },
        { image: "/images/homepage/science-3.jpg", title: "Space Exploration Reaches New Milestone", date: "2025-12-01", category: "SCIENCE" },
    ];

    const travelArticles = [
        { image: "/images/homepage/second-block-left-img-1.jpg", title: "Make travel hassle free with trainpal booking, changes and customer experience", date: "2025-12-03", category: "TRAVEL" },
        { image: "/images/homepage/second-block-left-img-2.jpg", title: "Hidden Gems of European Cities You Must Visit", date: "2025-12-02", category: "TRAVEL" },
        { image: "/images/homepage/second-block-left-img-3.jpg", title: "Mountain Adventures: Best Hiking Trails Worldwide", date: "2025-12-01", category: "TRAVEL" },
        { image: "/images/homepage/second-block-left-img-4.jpg", title: "Tropical Paradise: Island Hopping Guide", date: "2025-11-30", category: "TRAVEL" },
        { image: "/images/homepage/second-block-left-img-5.jpg", title: "Budget Travel: See the World Without Breaking Bank", date: "2025-11-29", category: "TRAVEL" },
    ];

    const recentArticles = [
        { image: "/images/homepage/recent-1.jpg", title: "Blast at Red Fort Delhi a City of shock and grief", date: "2025-12-03", category: "HOT NEWS" },
        { image: "/images/homepage/recent-2.jpg", title: "Food Tourism Traveling the Food Cultures", date: "2025-12-02", category: "FOOD" },
        { image: "/images/homepage/recent-3.jpg", title: "Holistic Healing for Mind Body and Spirit", date: "2025-12-01", category: "HEALTH" },
        { image: "/images/homepage/recent-4.jpg", title: "Technology Trends Shaping Our Future", date: "2025-11-30", category: "TECH" },
        { image: "/images/homepage/recent-5.jpg", title: "Fitness Revolution: New Training Methods", date: "2025-11-29", category: "FITNESS" },
    ];

    return (
        <div className="w-full bg-white dark:bg-black">
            <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
                {/* Left - Science Page (25%) - Sticky */}
                <div className="w-full lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800">
                    <div className="lg:sticky lg:top-0">
                        <div className="bg-white dark:bg-black z-10 border-b-2 border-red-600 pb-2 mb-6 px-4 pt-6">
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">SCIENCE</h1>
                        </div>
                        <div className="px-4 space-y-6 pb-6">
                            {scienceArticles.map((article, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="relative overflow-hidden mb-3">
                                        <img src={article.image} alt={article.title} className="w-full h-48 sm:h-40 lg:h-32 object-cover transition-all duration-300" />
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                                        <span className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 text-xs font-bold uppercase">{article.category}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors duration-300 line-clamp-2">{article.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{article.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center - Travel Page (50%) - Scrollable */}
                <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-200 px-4 lg:px-6 pb-6 dark:border-gray-800">
                    <div className="bg-white dark:bg-black z-10 border-b-2 border-red-600 pb-2 mb-6 pt-6">
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">RECENT ARTICLES</h1>
                    </div>
                    <div className="space-y-6">
                        {travelArticles.map((article, i) => (
                            <div key={i} className="group cursor-pointer flex flex-col sm:flex-row items-start gap-4">
                                <div className="relative overflow-hidden flex-shrink-0 w-full sm:w-40 h-48 sm:h-28">
                                    <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-all duration-300" />
                                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                                    <span className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 text-xs font-bold uppercase">{article.category}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors duration-300 line-clamp-3">{article.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{article.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right - Recent Articles Page (25%) - Sticky */}
                <div className="w-full lg:w-1/4">
                    <div className="lg:sticky lg:top-0">
                        <div className="bg-white dark:bg-black z-10 border-b-2 border-red-600 pb-2 mb-6 px-4 pt-6">
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">RECENT ARTICLES</h1>
                        </div>
                        <div className="px-4 space-y-6 pb-6">
                            {recentArticles.map((article, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="relative overflow-hidden mb-3">
                                        <img src={article.image} alt={article.title} className="w-full h-48 sm:h-40 lg:h-32 object-cover transition-all duration-300" />
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                                        <span className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 text-xs font-bold uppercase">{article.category}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors duration-300 line-clamp-2">{article.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{article.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}