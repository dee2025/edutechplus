import { AuthProvider } from "@/components/AuthProvider";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://articlegrip.com";

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
  name: "Edu Tech Pluse",
  url: BASE_URL,
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Edu Tech Pluse",
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
    default: "Edu Tech Pluse",
    template: "%s | Edu Tech Pluse",
  },
  description:
    "Discover insights and updates with Edu Tech Pluse – your source for the latest content.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Edu Tech Pluse",
    description:
      "Discover insights and updates with Edu Tech Pluse – your source for the latest content.",
    url: "/",
    siteName: "Edu Tech Pluse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edu Tech Pluse",
    description:
      "Discover insights and updates with Edu Tech Pluse – your source for the latest content.",
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
