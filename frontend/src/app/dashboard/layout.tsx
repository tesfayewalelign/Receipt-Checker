"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/verify", label: "Verify Receipt", icon: ShieldCheck },
  { to: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { to: "/dashboard/history", label: "Receipt History", icon: History },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950">
      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static z-30 w-64 bg-slate-900 border-r border-slate-800 transition-transform ${
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
            const active = pathname === item.to;

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

        {/* LOGOUT */}
        <div className="absolute bottom-0 w-full p-3 border-t border-slate-800">
          <button
            onClick={() => router.push("/sign-in")}
            className="w-full flex items-center gap-3 text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-white"
          >
            <Menu />
          </button>

          <div className="flex-1" />

          <Bell className="text-slate-400" />
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
