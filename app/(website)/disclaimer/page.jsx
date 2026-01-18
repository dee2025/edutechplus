import {
    AlertTriangle,
    Info,
    Shield,
    Code,
    ExternalLink,
} from "lucide-react";

export const metadata = {
    title: "Disclaimer | Tech & Startup Insights",
    description:
        "Read our disclaimer regarding content accuracy, professional advice, external links, and liability.",
};

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-[#020617] px-4 py-10 md:py-14">
            <div className="max-w-5xl mx-auto bg-[#111827] rounded-xl p-5 md:p-8 space-y-10">

                {/* HEADER */}
                <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                        Disclaimer
                    </h1>
                    <p className="text-gray-400 max-w-3xl leading-relaxed">
                        The information published on this website is for general
                        informational and educational purposes only. By using
                        this site, you agree to the terms outlined below.
                    </p>
                </div>

                {/* GENERAL INFORMATION */}
                <Section
                    icon={Info}
                    title="General Information"
                >
                    The content on this platform covers topics related to
                    technology, artificial intelligence, startups, programming,
                    gadgets, and digital products. While we strive to keep
                    information accurate and up to date, we make no guarantees
                    of completeness, reliability, or absolute accuracy.
                </Section>

                {/* NO PROFESSIONAL ADVICE */}
                <Section
                    icon={AlertTriangle}
                    title="No Professional Advice"
                >
                    Articles and guides published on this website do not
                    constitute professional, legal, financial, medical, or
                    business advice. Any decisions you make based on the
                    information found here are strictly at your own risk.
                    Always consult qualified professionals before making
                    critical decisions.
                </Section>

                {/* TECH & CODE */}
                <Section
                    icon={Code}
                    title="Code, Tools, and Technical Content"
                >
                    Code samples, tutorials, and technical explanations are
                    provided for educational purposes only. We do not guarantee
                    that code is free of errors, secure, or suitable for
                    production environments. You are responsible for reviewing,
                    testing, and validating any implementation.
                </Section>

                {/* EXTERNAL LINKS */}
                <Section
                    icon={ExternalLink}
                    title="External Links"
                >
                    This website may contain links to third-party websites,
                    tools, or services. We do not control or endorse the content,
                    policies, or practices of any external sites and are not
                    responsible for any loss or damage caused by their use.
                </Section>

                {/* LIMITATION OF LIABILITY */}
                <Section
                    icon={Shield}
                    title="Limitation of Liability"
                >
                    Under no circumstances shall this website or its authors be
                    liable for any direct, indirect, incidental, or
                    consequential damages arising from the use of the content,
                    services, or materials published on this platform.
                </Section>

                {/* FINAL NOTE */}
                <div className="bg-[#0b0f19] rounded-lg p-5 md:p-6">
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-3xl">
                        By continuing to use this website, you acknowledge that
                        you have read, understood, and agreed to this
                        disclaimer. We reserve the right to update or modify
                        this page at any time without prior notice.
                    </p>
                </div>

            </div>
        </div>
    );
}

/* Reusable section component */
function Section({ icon: Icon, title, children }) {
    return (
        <div className="flex gap-4">
            <div className="p-2 h-fit rounded-lg bg-[#0b0f19] text-cyan-400">
                <Icon size={18} />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-100 mb-1">
                    {title}
                </h2>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-3xl">
                    {children}
                </p>
            </div>
        </div>
    );
}
