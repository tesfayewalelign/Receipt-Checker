// Shared API + formatting helpers for receipt history / dashboard overview.
// Backed by the ReceiptLog table (GET /api/history, GET /api/dashboard/overview).

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface ReceiptLog {
  id: number;
  reference: string;
  amount: number | null;
  status: string; // "verified" | "failed" (and possibly others)
  provider: string; // provider id, e.g. "telebirr"
  createdAt: string;
}

export interface OverviewResponse {
  stats: {
    totalReceipts: number;
    verifiedReceipts: number;
    failedReceipts: number;
    totalAmount: number;
  };
  recentReceipts: ReceiptLog[];
}

/** Thrown when the user is not authenticated so callers can redirect to sign-in. */
export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/** Fetch the signed-in user's full receipt history. */
export async function fetchHistory(): Promise<ReceiptLog[]> {
  const res = await fetch(`${API_URL}/api/history`, {
    credentials: "include",
  });

  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new Error("Failed to load history");

  const json = await res.json();
  return json.data ?? [];
}

/** Fetch the signed-in user's dashboard overview (stats + recent receipts). */
export async function fetchOverview(): Promise<OverviewResponse> {
  const res = await fetch(`${API_URL}/api/dashboard/overview`, {
    credentials: "include",
  });

  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new Error("Failed to load overview");

  return res.json();
}

/** Map a provider id to a human-readable bank/service name. */
export const PROVIDER_NAMES: Record<string, string> = {
  cbe: "Commercial Bank of Ethiopia",
  telebirr: "Telebirr",
  "cbe-birr": "CBE Birr",
  boa: "Bank of Abyssinia",
  awash: "Awash Bank",
  dashen: "Dashen Bank",
  mpesa: "M-Pesa Ethiopia",
};

export function providerLabel(id: string): string {
  return PROVIDER_NAMES[id] ?? id;
}

/** Format an amount as `ETB 2,500`, or `—` when missing. */
export function formatAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return `ETB ${amount.toLocaleString("en-US")}`;
}

/** Short calendar date, e.g. `Jun 11, 2026`. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Relative time, e.g. `2 min ago`, `1 hr ago`, `3 days ago`. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return iso;

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  return formatDate(iso);
}
