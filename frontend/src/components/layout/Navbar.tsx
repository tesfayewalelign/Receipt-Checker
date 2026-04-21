"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "API Docs", href: "/api-docs" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
        <Link href="/" className="font-bold text-xl">
          ReceiptCheck
        </Link>

        <nav className="hidden md:flex gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                pathname === l.href ? "text-emerald-600" : "text-gray-600"
              }
            >
              {l.name}
            </Link>
          ))}
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2"
              onClick={() => setOpen(false)}
            >
              {l.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
