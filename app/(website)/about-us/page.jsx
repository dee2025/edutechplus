import {
    Cpu,
    Code,
    Lightbulb,
    ShieldCheck,
    Users,
    TrendingUp,
} from "lucide-react";

export const metadata = {
    title: "About Us | Tech & Startup Insights",
    description:
        "Learn about our mission, editorial standards, and how we cover technology, AI, startups, and programming.",
};

export default function AboutUsPage() {
    return (
        <div className="min-h-screen bg-[#020617] px-4 py-10 md:py-14">
            <div className="max-w-5xl mx-auto bg-[#111827] rounded-xl p-5 md:p-8 space-y-10">

                {/* HERO */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                        About Us
                    </h1>
                    <p className="text-gray-400 max-w-3xl leading-relaxed">
                        We are an independent digital publication focused on
                        technology, AI, startups, programming, and modern
                        digital products. Our goal is to help readers understand
                        what’s changing — and why it matters.
                    </p>
                </div>

                {/* WHAT WE COVER */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-100">
                        What We Cover
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Feature
                            icon={Cpu}
                            title="Technology & AI"
                            text="Emerging technologies, artificial intelligence,
                            and tools shaping the future of work and the internet."
                        />

                        <Feature
                            icon={Code}
                            title="Programming & Development"
                            text="Clear explanations, practical guides, and
                            real-world perspectives for developers and builders."
                        />

                        <Feature
                            icon={TrendingUp}
                            title="Startups & Digital Business"
                            text="Product thinking, startup ecosystems, growth
                            strategies, and lessons from modern businesses."
                        />

                        <Feature
                            icon={Users}
                            title="Gadgets & Digital Products"
                            text="Thoughtful coverage of gadgets and platforms —
                            focusing on usefulness, not hype."
                        />
                    </div>
                </div>

                {/* CONTENT PHILOSOPHY */}
                <div className="bg-[#0b0f19] rounded-lg p-5 md:p-6 space-y-4">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-100">
                        <Lightbulb size={18} />
                        Our Editorial Philosophy
                    </h2>

                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                        We believe the internet doesn’t need more noise. It needs
                        clarity. Our content is designed to explain complex
                        topics in a simple, honest, and structured way — without
                        exaggeration or clickbait.
                    </p>

                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                        Every article is written with intent: to inform, to
                        educate, and to respect the reader’s time.
                    </p>
                </div>

                {/* STANDARDS */}
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="p-2 rounded-lg bg-[#0b0f19] text-cyan-400">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-100">
                                Accuracy & Integrity
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed mt-1">
                                Content is researched, reviewed, and written
                                with accuracy in mind. We avoid speculation,
                                misleading headlines, and shallow summaries.
                            </p>
                        </div>
                    </div>
                </div>

                {/* WHO IT'S FOR */}
                <div className="bg-[#0b0f19] rounded-lg p-5 md:p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-100">
                        Who This Platform Is For
                    </h2>

                    <ul className="text-sm md:text-base text-gray-400 space-y-2">
                        <li>• Developers and engineers</li>
                        <li>• Startup founders and product builders</li>
                        <li>• Tech enthusiasts and students</li>
                        <li>• Professionals navigating a tech-driven world</li>
                    </ul>
                </div>

                {/* CLOSING */}
                <div className="pt-2">
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-3xl">
                        As technology evolves, our focus remains the same:
                        thoughtful content, practical insight, and long-term
                        value. We’re building a platform that grows with its
                        readers — one clear article at a time.
                    </p>
                </div>

            </div>
        </div>
    );
}

/* Small reusable component */
function Feature({ icon: Icon, title, text }) {
    return (
        <div className="flex gap-4">
            <div className="p-2 rounded-lg bg-[#0b0f19] text-cyan-400">
                <Icon size={18} />
            </div>
            <div>
                <h3 className="font-semibold text-gray-100">
                    {title}
                </h3>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                    {text}
                </p>
            </div>
        </div>
    );
}
