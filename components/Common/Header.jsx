"use client";

import Link from "next/link";
import { useState } from "react";

const Header = () => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { name: "AI", path: "/ai" },
    { name: "GADGETS", path: "/gadgets" },
    { name: "STARTUPS", path: "/startups" },
    { name: "CYBERSECURITY", path: "/cyber-security" },
    { name: "SPACE", path: "/space" },
    { name: "PROGRAMMING", path: "/programming" },
    { name: "REVIEWS", path: "/reviews" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo + Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden text-gray-300 text-2xl"
            >
              ☰
            </button>

            <Link href="/" className="font-mono text-2xl font-semibold">
              <span className="text-gray-200">edutech</span>
              <span className="text-cyan-400">+</span>
            </Link>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search global tech news..."
              className="w-full px-4 py-2 rounded-full bg-[#111827] text-gray-200 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {/* Right: CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/roadmaps"
              className="text-sm font-semibold text-cyan-400 hover:opacity-80"
            >
              Roadmaps
            </Link>
            <Link
              href="/latest-articles"
              className="text-sm font-semibold text-cyan-400 hover:opacity-80"
            >
              Latest Updates →
            </Link>
          </div>
        </div>

        {/* Category Pills */}
        {/* <div className="hidden lg:flex gap-3 mt-5 overflow-x-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#111827] text-gray-300 hover:bg-cyan-400 hover:text-black transition"
            >
              {item.name}
            </Link>
          ))}
        </div> */}
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden bg-[#0b0f19] border-t border-gray-800 px-4 py-4 space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setOpen(false)}
              className="block text-gray-300 text-sm font-semibold hover:text-cyan-400"
            >
              {item.name}
            </Link>
          ))}

          <input
            type="text"
            placeholder="Search..."
            className="w-full mt-3 px-4 py-2 rounded-md bg-[#111827] text-gray-200 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      )}
    </header>
  );
};

export default Header;
