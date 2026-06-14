"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Read the current auth state. `session` is null when logged out.
  const { data: session, isPending } = authClient.useSession();
  const isLoggedIn = !!session;

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setMobileMenuOpen(false);
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "Verifications", href: "/#providers" },
    { name: "API Docs", href: "/api-docs" },
  ];

  const isActive = (path: string) => pathname === path;

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
            <span className="text-lg font-bold text-white">R</span>
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              ReceiptCheck
            </span>

            <span className="hidden text-xs text-gray-500 sm:block">
              Receipt Verification Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`relative text-sm font-medium transition-all duration-200 ${
                isActive(link.href)
                  ? "text-emerald-600"
                  : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              {link.name}

              {isActive(link.href) && (
                <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-emerald-500" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 lg:flex">
          {isPending ? null : isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:from-emerald-600 hover:to-cyan-600 hover:shadow-xl"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl border border-transparent px-5 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-200 hover:bg-gray-50 hover:text-emerald-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="rounded-xl border border-transparent px-5 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-200 hover:bg-gray-50 hover:text-emerald-600"
              >
                Sign In
              </Link>

              <Link
                href="/auth/sign-up"
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:from-emerald-600 hover:to-cyan-600 hover:shadow-xl"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label="Toggle Menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-all duration-200 hover:bg-gray-50 lg:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${
          mobileMenuOpen
            ? "max-h-screen border-t border-gray-200 opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white px-4 py-6 sm:px-6">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            {isPending ? null : isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-cyan-600"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  Sign In
                </Link>

                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-cyan-600"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
