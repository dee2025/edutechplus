import {
    FileText,
    Shield,
    AlertTriangle,
    UserCheck,
    ExternalLink,
    Ban,
} from "lucide-react";

export const metadata = {
    title: "Terms & Conditions | Tech & Startup Insights",
    description:
        "Read the terms and conditions governing the use of our website, content, and services.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#020617] px-4 py-10 md:py-14">
            <div className="max-w-5xl mx-auto bg-[#111827] rounded-xl p-5 md:p-8 space-y-10">

                {/* HEADER */}
                <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                        Terms & Conditions
                    </h1>
                    <p className="text-gray-400 max-w-3xl leading-relaxed">
                        These Terms & Conditions govern your use of this
                        website. By accessing or using this platform, you agree
                        to comply with the terms outlined below.
                    </p>
                </div>

                {/* ACCEPTANCE */}
                <Section
                    icon={UserCheck}
                    title="Acceptance of Terms"
                >
                    By accessing this website, you confirm that you have read,
                    understood, and agreed to these Terms & Conditions. If you
                    do not agree with any part of these terms, you must not use
                    this website.
                </Section>

                {/* USE OF CONTENT */}
                <Section
                    icon={FileText}
                    title="Use of Content"
                >
                    All content published on this website, including articles,
                    code snippets, graphics, and media, is provided for
                    informational and educational purposes only. You may view,
                    share, and reference content for personal, non-commercial
                    use with proper attribution. Republishing or redistributing
                    content without permission is prohibited.
                </Section>

                {/* USER RESPONSIBILITIES */}
                <Section
                    icon={Shield}
                    title="User Responsibilities"
                >
                    You agree to use this website lawfully and responsibly. You
                    must not attempt to disrupt site functionality, access
                    restricted areas, or engage in activities that may harm the
                    platform, its users, or its reputation.
                </Section>

                {/* NO WARRANTIES */}
                <Section
                    icon={AlertTriangle}
                    title="No Warranties"
                >
                    This website and its content are provided “as is” without
                    warranties of any kind. We do not guarantee the accuracy,
                    completeness, or reliability of any information published
                    on the platform.
                </Section>

                {/* THIRD PARTY LINKS */}
                <Section
                    icon={ExternalLink}
                    title="Third-Party Links"
                >
                    The website may contain links to third-party websites or
                    services. We do not control or endorse these external
                    platforms and are not responsible for their content,
                    policies, or practices.
                </Section>

                {/* TERMINATION */}
                <Section
                    icon={Ban}
                    title="Termination of Access"
                >
                    We reserve the right to restrict or terminate access to the
                    website at any time, without notice, if a user violates
                    these Terms & Conditions or engages in harmful behavior.
                </Section>

                {/* CHANGES */}
                <div className="bg-[#0b0f19] rounded-lg p-5 md:p-6">
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-3xl">
                        We may update or modify these Terms & Conditions at any
                        time. Continued use of the website after changes are
                        posted constitutes acceptance of the revised terms.
                    </p>
                </div>

            </div>
        </div>
    );
}

/* Reusable Section Component */
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
