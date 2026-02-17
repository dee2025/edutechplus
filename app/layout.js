import { AuthProvider } from "@/components/AuthProvider";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://edutechplus.com";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "EduTechPlus",
  url: BASE_URL,
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "EduTechPlus",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/latest-articles?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "EduTechPlus",
    template: "%s | EduTechPlus",
  },
  description:
    "Discover insights and updates with EduTechPlus – your source for the latest content.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "EduTechPlus",
    description:
      "Discover insights and updates with EduTechPlus – your source for the latest content.",
    url: "/",
    siteName: "EduTechPlus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduTechPlus",
    description:
      "Discover insights and updates with EduTechPlus – your source for the latest content.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <Analytics />
            <Toaster position="top-center" reverseOrder={false} />
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
