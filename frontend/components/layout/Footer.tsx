import { Mail } from "lucide-react";
import Link from "next/link";
import { FaGithub, FaTelegramPlane } from "react-icons/fa";

const GITHUB_URL = "https://github.com/tesfayewalelign";
const TELEGRAM_URL = "https://t.me/howa13";
const EMAIL = "tesfayewalelign2@gmail.com";

export default function Footer() {
  const nav = {
    product: [
      { name: "Features", href: "/features" },
      { name: "Verifications", href: "/#providers" },
      { name: "API Docs", href: "/api-docs" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Sign In", href: "/auth/sign-in" },
      { name: "Get Started", href: "/auth/sign-up" },
    ],
  };

  const socials = [
    {
      name: "GitHub",
      href: GITHUB_URL,
      icon: <FaGithub className="h-5 w-5" />,
      external: true,
    },
    {
      name: "Telegram",
      href: TELEGRAM_URL,
      icon: <FaTelegramPlane className="h-5 w-5" />,
      external: true,
    },
    {
      name: "Email",
      href: `mailto:${EMAIL}`,
      icon: <Mail className="h-5 w-5" />,
      external: false,
    },
  ];

  return (
    <footer className="border-t border-gray-800 bg-gray-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* BRAND */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
                <span className="text-lg font-bold text-white">R</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                EthioVerify
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-400">
              The trusted payment receipt verification platform for Ethiopian
              businesses and developers — fast, reliable, and built for scale.
            </p>

            <Link
              href="/auth/sign-up"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:from-emerald-600 hover:to-cyan-600 hover:shadow-xl"
            >
              Get Started Free
            </Link>
          </div>

          {/* PRODUCT */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-white">Product</h4>
            <ul className="mt-4 space-y-3">
              {nav.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-emerald-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-3">
              {nav.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-emerald-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONNECT */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold text-white">Connect</h4>
            <p className="mt-4 text-sm text-gray-400">
              Questions or feedback? Reach out anytime.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  title={s.name}
                  {...(s.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-gray-400 ring-1 ring-gray-800 transition-all duration-200 hover:bg-emerald-500 hover:text-white hover:ring-emerald-500"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-xs text-gray-500">
            © 2026 EthioVerify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
