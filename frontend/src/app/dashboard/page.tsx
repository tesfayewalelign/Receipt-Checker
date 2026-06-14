"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  TrendingUp,
  Activity,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Banknote,
  Smartphone,
  Building2,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const weekData = [
  { day: "Mon", verifications: 142, fraud: 1 },
  { day: "Tue", verifications: 189, fraud: 0 },
  { day: "Wed", verifications: 234, fraud: 2 },
  { day: "Thu", verifications: 178, fraud: 1 },
  { day: "Fri", verifications: 312, fraud: 3 },
  { day: "Sat", verifications: 98, fraud: 0 },
  { day: "Sun", verifications: 94, fraud: 0 },
];

const recentHistory = [
  {
    id: "TXN-8841",
    provider: "Telebirr",
    amount: "ETB 2,500",
    status: "verified",
    time: "2 min ago",
    ref: "TLB-20260611-9921",
  },
  {
    id: "TXN-8840",
    provider: "CBE",
    amount: "ETB 15,000",
    status: "verified",
    time: "12 min ago",
    ref: "CBE-20260611-4471",
  },
  {
    id: "TXN-8839",
    provider: "Awash Bank",
    amount: "ETB 800",
    status: "fraud",
    time: "1 hr ago",
    ref: "AWB-20260611-0012",
  },
];

const stats = [
  {
    label: "Verifications",
    value: "1,247",
    delta: "+12.4%",
    up: true,
    icon: CheckCircle2,
  },
  {
    label: "Success Rate",
    value: "98.5%",
    delta: "+0.3%",
    up: true,
    icon: TrendingUp,
  },
  {
    label: "Avg Time",
    value: "178ms",
    delta: "-14ms",
    up: true,
    icon: Activity,
  },
  { label: "Fraud", value: "3", delta: "+1", up: false, icon: ShieldAlert },
];

export default function OverviewPage() {
  const [period, setPeriod] = useState("7d");

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Welcome back 👋</h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor your receipt verification activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/verify"
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition"
          >
            <ShieldAlert className="w-4 h-4" />
            Verify Receipt
          </Link>

          <Link
            href="/dashboard/api-keys"
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold border border-slate-700 hover:bg-slate-700 transition"
          >
            Generate API Key
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl"
            >
              <div className="flex justify-between items-center">
                <Icon className="text-emerald-400 w-5 h-5" />
                <span
                  className={
                    s.up ? "text-emerald-400 text-xs" : "text-red-400 text-xs"
                  }
                >
                  {s.delta}
                </span>
              </div>

              <div className="text-white text-2xl font-bold mt-3">
                {s.value}
              </div>

              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* CHART */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Verification Activity</h2>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="verifications"
              stroke="#10b981"
              fill="#10b98133"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* RECENT */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-white font-bold">Recent Verifications</h2>
        </div>

        <div className="divide-y divide-slate-800">
          {recentHistory.map((r) => (
            <div key={r.id} className="p-4 flex justify-between">
              <div>
                <p className="text-white text-sm">{r.provider}</p>
                <p className="text-slate-400 text-xs">{r.ref}</p>
              </div>

              <div className="text-right">
                <p className="text-white text-sm">{r.amount}</p>
                <p className="text-slate-400 text-xs">{r.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
