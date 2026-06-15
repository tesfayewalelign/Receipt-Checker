"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Key,
  History,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Zap,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/verify", label: "Verify Receipt", icon: ShieldCheck },
  { to: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { to: "/dashboard/history", label: "Receipt History", icon: History },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

/** Resolve the current page title from the path (longest matching nav item). */
function usePageTitle(pathname: string) {
  const match = navItems
    .filter((i) => pathname === i.to || pathname.startsWith(i.to + "/"))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return match?.label ?? "Dashboard";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [open, setOpen] = useState(false); // mobile sidebar
  const [menuOpen, setMenuOpen] = useState(false); // user dropdown
  const [signingOut, setSigningOut] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const title = usePageTitle(pathname);

  const user = session?.user;
  const displayName = user?.name || "User";
  const initial = displayName.trim()[0]?.toUpperCase() || "U";

  // Close drawer + dropdown whenever the route changes.
  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close the user dropdown on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out failed", err);
      setSigningOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static z-30 h-full w-64 bg-slate-900 border-r border-slate-800 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* LOGO */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Zap className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">ReceiptCheck</h1>
            <p className="text-emerald-400 text-xs">Dashboard</p>
          </div>

          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden">
            <X className="text-white w-5 h-5" />
          </button>
        </div>

        {/* NAV */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const active =
              pathname === item.to ||
              (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"));

            return (
              <Link
                key={item.to}
                href={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER: back to site + sign out */}
        <div className="absolute bottom-0 w-full p-3 border-t border-slate-800 space-y-1">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-4 h-4" />
            View Site
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {signingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center gap-3 px-4">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-white"
            aria-label="Open menu"
          >
            <Menu />
          </button>

          <h2 className="text-sm font-semibold text-white truncate">{title}</h2>

          <div className="flex-1" />

          {/* View site (desktop quick link) */}
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Site
          </Link>

          {/* USER MENU */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 hover:bg-slate-800 transition"
            >
              <span className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[#0a0c10] font-semibold text-sm">
                {initial}
              </span>
              <span className="hidden sm:block text-left leading-tight">
                <span className="block text-xs font-medium text-white max-w-[140px] truncate">
                  {displayName}
                </span>
                <span className="block text-[11px] text-slate-500 max-w-[140px] truncate">
                  {user?.email || ""}
                </span>
              </span>
              <ChevronDown className="hidden sm:block w-4 h-4 text-slate-500" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-40">
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-sm font-medium text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email || "Not signed in"}
                  </p>
                </div>

                <div className="p-1.5">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    Settings
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                    View Site
                  </Link>
                </div>

                <div className="p-1.5 border-t border-slate-800">
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {signingOut ? "Signing out…" : "Sign Out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
