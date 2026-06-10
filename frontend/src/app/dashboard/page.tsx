export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-white shadow rounded-xl">Total Receipts</div>
        <div className="p-4 bg-white shadow rounded-xl">Verified</div>
        <div className="p-4 bg-white shadow rounded-xl">Failed</div>
      </div>
    </div>
  );
}
