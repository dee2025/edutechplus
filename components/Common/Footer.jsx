import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#0b0f19] border-t border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-14">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-200">
                EduTech
              </span>
              <span className="text-2xl font-bold text-cyan-500 dark:text-cyan-400">
                +
              </span>
            </Link>

            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              EduTechPlus is a global tech and education news platform covering
              AI, programming, startups, gadgets, and the technologies shaping
              how the world learns and builds.
            </p>
          </div>

          {/* Sections */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">
              Sections
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  href="/latest"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Latest News
                </Link>
              </li>
              <li>
                <Link
                  href="/ai"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  AI & ML
                </Link>
              </li>
              <li>
                <Link
                  href="/programming"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Programming
                </Link>
              </li>
              <li>
                <Link
                  href="/gadgets"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Gadgets
                </Link>
              </li>
              <li>
                <Link
                  href="/startups"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Startups
                </Link>
              </li>
            </ul>
          </div>

          {/* Topics */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">
              Topics
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  href="/cyber-security"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Cybersecurity
                </Link>
              </li>
              <li>
                <Link
                  href="/space-tech"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Space Tech
                </Link>
              </li>
              <li>
                <Link
                  href="/edtech"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  EdTech
                </Link>
              </li>
              <li>
                <Link
                  href="/reviews"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/guides"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  href="/about-us"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/unsubscribe"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Unsubscribe
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 my-10" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-500">
          <span>
            © {new Date().getFullYear()} EduTechPlus. All rights reserved.
          </span>

          <div className="flex gap-4">
            <a
              href="#"
              className="hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              Twitter
            </a>
            <a
              href="#"
              className="hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
