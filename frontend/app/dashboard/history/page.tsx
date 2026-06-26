"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  History,
  Hash,
  Wallet,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  fetchHistory,
  providerLabel,
  formatAmount,
  formatDate,
  relativeTime,
  UnauthorizedError,
  type ReceiptLog,
} from "@/lib/history";

/* Visual style per status — emerald for verified, slate for everything else. */
const STATUS: Record<
  string,
  {
    label: string;
    icon: typeof CheckCircle2;
    color: string;
    bg: string;
    border: string;
  }
> = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
  fraud: {
    label: "Fraud",
    icon: XCircle,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
};

function statusStyle(status: string) {
  return STATUS[status] ?? STATUS.failed;
}

const PAGE_SIZE = 8;

export default function HistoryPage() {
  const router = useRouter();

  const [receipts, setReceipts] = useState<ReceiptLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<ReceiptLog | null>(null);

  /* LOAD REAL DATA */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchHistory();
        if (active) setReceipts(data);
      } catch (err) {
        if (!active) return;
        if (err instanceof UnauthorizedError) {
          router.push("/auth/sign-in");
          return;
        }
        console.error("Failed loading history", err);
        setError("Couldn't load your receipt history. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return receipts.filter((r) => {
      const matchSearch =
        (r.reference ?? "").toLowerCase().includes(q) ||
        providerLabel(r.provider).toLowerCase().includes(q);
      const matchStatus = status === "all" || r.status === status;
      return matchSearch && matchStatus;
    });
  }, [receipts, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="min-h-full text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <History size={16} className="text-emerald-400" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              Receipt History
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Track and review all your verification activity.
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by reference or provider..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#11141a] border border-white/[0.08] rounded-lg text-sm placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-[#11141a] border border-white/[0.08] text-white rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-[#11141a] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <span className="text-xs font-medium text-slate-400">
              {loading
                ? "Loading…"
                : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
            </span>
          </div>

          {loading ? (
            <div className="divide-y divide-white/[0.06]">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="px-4 py-4 flex items-center justify-between animate-pulse"
                >
                  <div className="space-y-2">
                    <div className="h-3.5 w-40 bg-white/[0.06] rounded" />
                    <div className="h-3 w-28 bg-white/[0.04] rounded" />
                  </div>
                  <div className="h-6 w-20 bg-white/[0.04] rounded-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-4 py-12 flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 mb-3">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <p className="text-sm font-medium text-slate-300">
                Something went wrong
              </p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">{error}</p>
            </div>
          ) : pageData.length === 0 ? (
            <div className="px-4 py-12 flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.04] mb-3">
                <Search size={18} className="text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-300">
                {receipts.length === 0
                  ? "No receipts yet"
                  : "No receipts found"}
              </p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                {receipts.length === 0
                  ? "Verify a receipt and it will show up here."
                  : "Try adjusting your search or filter to find what you're looking for."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Reference
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Provider
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Submitted
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {pageData.map((r) => {
                    const s = statusStyle(r.status);
                    const Icon = s.icon;

                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-white/[0.015] transition-colors"
                      >
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-300">
                          {r.reference ?? "—"}
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">
                          {providerLabel(r.provider)}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-white">
                          {formatAmount(r.amount)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 text-xs">
                          {relativeTime(r.createdAt)}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${s.bg} ${s.border} ${s.color}`}
                          >
                            <Icon size={12} />
                            {s.label}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setDetail(r)}
                            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Page {safePage} of {totalPages}
            </span>

            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {detail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#11141a] border border-white/[0.08] p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h2 className="text-base font-semibold">Receipt details</h2>
                <p className="font-mono text-xs text-slate-500 mt-1">
                  {detail.reference ?? "—"}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* status badge */}
            <div className="mt-4">
              {(() => {
                const s = statusStyle(detail.status);
                const Icon = s.icon;
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${s.bg} ${s.border} ${s.color}`}
                  >
                    <Icon size={12} />
                    {s.label}
                  </span>
                );
              })()}
            </div>

            {/* details grid */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-[#0a0c10] border border-white/[0.06] rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Wallet size={12} /> Provider
                </div>
                <p className="text-sm font-medium">
                  {providerLabel(detail.provider)}
                </p>
              </div>

              <div className="bg-[#0a0c10] border border-white/[0.06] rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Hash size={12} /> Amount
                </div>
                <p className="text-sm font-medium">
                  {formatAmount(detail.amount)}
                </p>
              </div>

              <div className="bg-[#0a0c10] border border-white/[0.06] rounded-lg p-3 col-span-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Calendar size={12} /> Date
                </div>
                <p className="text-sm font-medium">
                  {formatDate(detail.createdAt)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setDetail(null)}
              className="mt-5 w-full bg-white/[0.06] hover:bg-white/[0.1] py-2.5 text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
