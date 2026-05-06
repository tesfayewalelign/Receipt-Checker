"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Features", href: "/features" },

    { name: "API Docs", href: "/api-docs" },
    { name: "About", href: "/about" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* MAIN NAV BAR */}
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl" />
            <span className="text-gray-900 font-bold text-lg sm:text-xl">
              ReceiptCheck
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm lg:text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-emerald-600"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition">
              Sign In
            </button>

            <button className="text-sm font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-4 lg:px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all">
              Get Started
            </button>
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-200 pt-4 flex flex-col gap-4">
            {/* LINKS */}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-emerald-600"
                    : "text-gray-700 hover:text-emerald-600"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* ACTIONS */}
            <div className="flex flex-col gap-3 pt-4">
              <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:border-emerald-500 hover:text-emerald-600 transition">
                Sign In
              </button>

              <button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-2 rounded-lg font-semibold shadow-md">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
