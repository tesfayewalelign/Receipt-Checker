import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r p-5 min-h-screen">
      <h1 className="text-xl font-bold mb-6">ReceiptCheck</h1>

      <nav className="flex flex-col gap-3">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/history">History</Link>
        <Link href="/dashboard/verify">Verify</Link>
        <Link href="/dashboard/settings">Settings</Link>
      </nav>
    </div>
  );
}
