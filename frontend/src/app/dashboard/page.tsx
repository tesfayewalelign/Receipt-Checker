"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Activity,
  XCircle,
  Banknote,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  fetchOverview,
  providerLabel,
  formatAmount,
  relativeTime,
  UnauthorizedError,
  type OverviewResponse,
} from "@/lib/history";

/* Illustrative weekly trend — no per-day aggregation endpoint exists yet. */
const sampleWeek = [
  { day: "Mon", verifications: 142 },
  { day: "Tue", verifications: 189 },
  { day: "Wed", verifications: 234 },
  { day: "Thu", verifications: 178 },
  { day: "Fri", verifications: 312 },
  { day: "Sat", verifications: 98 },
  { day: "Sun", verifications: 94 },
];

export default function OverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchOverview();
        if (active) setData(res);
      } catch (err) {
        if (!active) return;
        if (err instanceof UnauthorizedError) {
          router.push("/auth/sign-in");
          return;
        }
        console.error("Failed loading overview", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const stats = data?.stats;
  const recent = data?.recentReceipts ?? [];

  const cards = [
    {
      label: "Verifications",
      value: stats?.totalReceipts ?? 0,
      icon: CheckCircle2,
    },
    {
      label: "Verified",
      value: stats?.verifiedReceipts ?? 0,
      icon: ShieldCheck,
    },
    {
      label: "Failed",
      value: stats?.failedReceipts ?? 0,
      icon: XCircle,
    },
    {
      label: "Total Amount",
      value: formatAmount(stats?.totalAmount ?? 0),
      icon: Banknote,
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor your receipt verification activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/verify"
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition"
          >
            <ShieldCheck className="w-4 h-4" />
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
        {cards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl"
            >
              <div className="flex justify-between items-center">
                <Icon className="text-emerald-400 w-5 h-5" />
              </div>

              <div className="text-white text-2xl font-bold mt-3">
                {loading ? (
                  <span className="inline-block h-7 w-20 bg-white/[0.06] rounded animate-pulse" />
                ) : (
                  s.value
                )}
              </div>

              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* CHART */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Verification Activity</h2>
          <span className="text-[11px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            Sample data
          </span>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={sampleWeek}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 8,
                color: "#fff",
              }}
            />
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
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-white font-bold">Recent Verifications</h2>
          <Link
            href="/dashboard/history"
            className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
          >
            View all
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-800">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="p-4 flex justify-between animate-pulse"
              >
                <div className="space-y-2">
                  <div className="h-3.5 w-28 bg-white/[0.06] rounded" />
                  <div className="h-3 w-40 bg-white/[0.04] rounded" />
                </div>
                <div className="h-3.5 w-16 bg-white/[0.06] rounded" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.04] mb-3">
              <Activity size={18} className="text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">
              No verifications yet
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Verify your first receipt to see it here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recent.map((r) => (
              <div key={r.id} className="p-4 flex justify-between">
                <div>
                  <p className="text-white text-sm">
                    {providerLabel(r.provider)}
                  </p>
                  <p className="text-slate-400 text-xs font-mono">
                    {r.reference}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-white text-sm">{formatAmount(r.amount)}</p>
                  <p className="text-slate-400 text-xs">
                    {relativeTime(r.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
