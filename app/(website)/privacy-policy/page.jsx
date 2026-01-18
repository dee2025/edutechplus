import {
    ShieldCheck,
    Database,
    Mail,
    Cookie,
    ExternalLink,
    RefreshCcw,
} from "lucide-react";

export const metadata = {
    title: "Privacy Policy | Tech & Startup Insights",
    description:
        "Learn how we collect, use, and protect your personal information when you use our website.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#020617] px-4 py-10 md:py-14">
            <div className="max-w-5xl mx-auto bg-[#111827] rounded-xl p-5 md:p-8 space-y-10">

                {/* HEADER */}
                <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-400 max-w-3xl leading-relaxed">
                        Your privacy is important to us. This Privacy Policy
                        explains how we collect, use, and protect your
                        information when you use our website.
                    </p>
                </div>

                {/* INFORMATION WE COLLECT */}
                <Section
                    icon={Database}
                    title="Information We Collect"
                >
                    We may collect personal information such as your name,
                    email address, and messages when you contact us through
                    forms or subscribe to updates. We also collect non-personal
                    information including browser type, device information,
                    pages visited, and usage patterns to improve our platform.
                </Section>

                {/* HOW WE USE DATA */}
                <Section
                    icon={ShieldCheck}
                    title="How We Use Your Information"
                >
                    Information collected is used to respond to inquiries,
                    improve content quality, analyze website performance,
                    enhance user experience, and maintain platform security.
                    We do not sell or rent personal data to third parties.
                </Section>

                {/* COOKIES */}
                <Section
                    icon={Cookie}
                    title="Cookies and Tracking Technologies"
                >
                    This website may use cookies and similar technologies to
                    understand user behavior, measure traffic, and improve
                    functionality. You can control or disable cookies through
                    your browser settings; however, some features may not work
                    as intended.
                </Section>

                {/* THIRD PARTY SERVICES */}
                <Section
                    icon={ExternalLink}
                    title="Third-Party Services"
                >
                    We may use third-party tools such as analytics providers,
                    advertising networks, or embedded content. These services
                    may collect information in accordance with their own
                    privacy policies. We are not responsible for how third
                    parties handle your data.
                </Section>

                {/* DATA SECURITY */}
                <Section
                    icon={ShieldCheck}
                    title="Data Security"
                >
                    We implement reasonable technical and organizational
                    measures to protect your information from unauthorized
                    access, alteration, or misuse. However, no method of
                    transmission over the internet is completely secure.
                </Section>

                {/* USER RIGHTS */}
                <Section
                    icon={Mail}
                    title="Your Rights and Choices"
                >
                    You have the right to request access, correction, or
                    deletion of your personal information. If you have any
                    questions or concerns regarding your data, you may contact
                    us directly.
                </Section>

                {/* POLICY UPDATES */}
                <Section
                    icon={RefreshCcw}
                    title="Updates to This Policy"
                >
                    We may update this Privacy Policy from time to time to
                    reflect changes in technology, legal requirements, or our
                    practices. Any updates will be posted on this page with
                    immediate effect.
                </Section>

                {/* FINAL NOTE */}
                <div className="bg-[#0b0f19] rounded-lg p-5 md:p-6">
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-3xl">
                        By using this website, you agree to the collection and
                        use of information as described in this Privacy Policy.
                        Continued use of the site signifies acceptance of any
                        updates or changes.
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
