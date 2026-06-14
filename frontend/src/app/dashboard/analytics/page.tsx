"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type KpiType = {
  totalVerifications: number;
  fraudRate: number;
  avgResponseTime: number;
  uptime: number;
};

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<KpiType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dashboard/kpis");
        const data = await res.json();
        setKpis(data);
      } catch (err) {
        console.error("Failed to fetch KPIs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();
  }, []);

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-6">Analytics</h1>

      {/* LOADING STATE */}
      {loading && <div className="text-slate-400">Loading KPIs...</div>}

      {/* KPI GRID */}
      {kpis && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl">
            <p className="text-slate-400 text-sm">Total Verifications</p>
            <p className="text-white text-2xl font-bold">
              {kpis.totalVerifications}
            </p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl">
            <p className="text-slate-400 text-sm">Fraud Rate</p>
            <p className="text-white text-2xl font-bold">{kpis.fraudRate}%</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl">
            <p className="text-slate-400 text-sm">Avg Response Time</p>
            <p className="text-white text-2xl font-bold">
              {kpis.avgResponseTime}ms
            </p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl">
            <p className="text-slate-400 text-sm">Uptime</p>
            <p className="text-white text-2xl font-bold">{kpis.uptime}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
