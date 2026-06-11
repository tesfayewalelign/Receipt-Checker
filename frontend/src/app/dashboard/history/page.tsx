"use client";
import { useState } from "react";
import {
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  History,
} from "lucide-react";

interface Receipt {
  id: string;
  txnRef: string;
  provider: string;
  amount: string;
  account: string;
  date: string;
  submittedAt: string;
  status: "verified" | "fraud" | "pending" | "failed";
  responseTime: string;
  confidence: number;
  notes: string;
}

/* MOCK DATA (keep for now) */
const allReceipts: Receipt[] = [
  {
    id: "1",
    txnRef: "TLB-20260611-9921",
    provider: "Telebirr",
    amount: "ETB 2,500",
    account: "••••3291",
    date: "2026-06-11",
    submittedAt: "2 min ago",
    status: "verified",
    responseTime: "142ms",
    confidence: 99,
    notes: "Transaction confirmed via Telebirr API.",
  },
  {
    id: "2",
    txnRef: "CBE-20260611-4471",
    provider: "CBE",
    amount: "ETB 15,000",
    account: "••••7812",
    date: "2026-06-11",
    submittedAt: "12 min ago",
    status: "verified",
    responseTime: "188ms",
    confidence: 97,
    notes: "Amount and reference match.",
  },
  {
    id: "3",
    txnRef: "AWB-20260611-0012",
    provider: "Awash Bank",
    amount: "ETB 800",
    account: "••••4400",
    date: "2026-06-11",
    submittedAt: "1 hr ago",
    status: "fraud",
    responseTime: "210ms",
    confidence: 12,
    notes: "Reference not found in system.",
  },
];

const STATUS = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    color: "text-emerald-400",
  },
  fraud: { label: "Fraud", icon: XCircle, color: "text-red-400" },
  pending: { label: "Pending", icon: Clock, color: "text-amber-400" },
  failed: { label: "Failed", icon: XCircle, color: "text-slate-400" },
};

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Receipt | null>(null);

  const filtered = allReceipts.filter((r) => {
    const matchSearch =
      r.txnRef.toLowerCase().includes(search.toLowerCase()) ||
      r.provider.toLowerCase().includes(search.toLowerCase());

    const matchStatus = status === "all" || r.status === status;

    return matchSearch && matchStatus;
  });

  const PAGE_SIZE = 5;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-white text-2xl font-bold flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-400" />
          Receipt History
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Track all your verification activity
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipts..."
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 py-2.5 text-sm"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm"
        >
          <option value="all">All</option>
          <option value="verified">Verified</option>
          <option value="fraud">Fraud</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="text-left p-4">Reference</th>
              <th className="text-left p-4">Provider</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {pageData.map((r) => {
              const s = STATUS[r.status];
              const Icon = s.icon;

              return (
                <tr key={r.id} className="border-t border-slate-800">
                  <td className="p-4 text-slate-300 font-mono">{r.txnRef}</td>
                  <td className="p-4 text-slate-200">{r.provider}</td>
                  <td className="p-4 text-white font-semibold">{r.amount}</td>

                  <td className="p-4">
                    <span className={`flex items-center gap-1 ${s.color}`}>
                      <Icon className="w-4 h-4" />
                      {s.label}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => setDetail(r)}
                      className="text-emerald-400 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center text-slate-400">
        <span>
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft />
          </button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* MODAL */}
      {detail && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-2xl max-w-md w-full">
            <div className="flex justify-between">
              <h2 className="text-white font-bold">Receipt Details</h2>
              <button onClick={() => setDetail(null)}>
                <X className="text-white" />
              </button>
            </div>

            <div className="mt-4 space-y-2 text-slate-300 text-sm">
              <p>Provider: {detail.provider}</p>
              <p>Amount: {detail.amount}</p>
              <p>Status: {detail.status}</p>
              <p>Notes: {detail.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
