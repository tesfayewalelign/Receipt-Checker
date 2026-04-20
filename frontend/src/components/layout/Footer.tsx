"use client";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

import { Link } from "react-router-dom";

const footerLinks = {
  product: [
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "API Docs", path: "/api-docs" },
    { name: "Status", path: "/status" },
  ],
  company: [
    { name: "About Us", path: "/about" },
    { name: "Careers", path: "/careers" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ],
  resources: [
    { name: "Documentation", path: "/api-docs" },
    { name: "Guides", path: "/guides" },
    { name: "Support", path: "/support" },
    { name: "Community", path: "/community" },
  ],
  legal: [
    { name: "Privacy Policy", path: "/privacy-policy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cookie Policy", path: "/cookies" },
    { name: "Compliance", path: "/compliance" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                R
              </div>

              <div>
                <h2 className="text-white text-xl font-bold">ReceiptCheck</h2>
                <p className="text-sm text-slate-400">Verification Platform</p>
              </div>
            </Link>

            <p className="text-slate-400 leading-7 mb-6 max-w-sm">
              Trusted Ethiopian payment receipt verification platform for
              businesses, startups, fintech companies, and developers.
            </p>

            {/* Social */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-500 transition flex items-center justify-center"
              >
                <Twitter size={18} />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-500 transition flex items-center justify-center"
              >
                <Github size={18} />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-500 transition flex items-center justify-center"
              >
                <Linkedin size={18} />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-500 transition flex items-center justify-center"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <FooterColumn title="Product" links={footerLinks.product} />
          <FooterColumn title="Company" links={footerLinks.company} />
          <FooterColumn title="Resources" links={footerLinks.resources} />
          <FooterColumn title="Legal" links={footerLinks.legal} />
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 text-center md:text-left">
            © 2026 ReceiptCheck. All rights reserved.
          </p>

          <p className="text-sm text-slate-400 text-center md:text-right">
            Made with ❤️ in Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
}

type FooterLink = {
  name: string;
  path: string;
};

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-5">{title}</h3>

      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              to={link.path}
              className="text-slate-400 hover:text-emerald-400 transition"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
