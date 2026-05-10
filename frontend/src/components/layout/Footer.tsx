import { GitBranch, Globe, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const links = {
    product: [
      { name: "Features", href: "/features" },
      { name: "API Docs", href: "/api-docs" },
      { name: "Status", href: "#" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Contact", href: "#" },
    ],
    resources: [
      { name: "Documentation", href: "/api-docs" },
      { name: "Guides", href: "#" },
      { name: "Support", href: "#" },
      { name: "Community", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Compliance", href: "#" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* TOP GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 sm:gap-12 mb-12">
          {/* BRAND */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl" />
              <span className="text-white font-bold text-lg sm:text-xl">
                ReceiptCheck
              </span>
            </Link>

            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6 max-w-sm">
              The most trusted payment receipt verification platform for
              Ethiopian businesses and developers.
            </p>

            {/* SOCIAL */}
            <div className="flex items-center gap-3 sm:gap-4">
              {[GitBranch, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 hover:bg-emerald-500 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* LINK COLUMNS */}
          {[
            { title: "Product", items: links.product },
            { title: "Company", items: links.company },
            { title: "Resources", items: links.resources },
            { title: "Legal", items: links.legal },
          ].map((section, idx) => (
            <div key={idx}>
              <h4 className="text-white font-semibold mb-4 text-sm sm:text-base">
                {section.title}
              </h4>

              <ul className="space-y-2 sm:space-y-3">
                {section.items.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-gray-400 text-sm sm:text-base hover:text-emerald-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <p className="text-gray-400 text-xs sm:text-sm">
              © 2026 ReceiptCheck. All rights reserved.
            </p>

            <p className="text-gray-400 text-xs sm:text-sm">
              Made with ❤️ in Ethiopia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
