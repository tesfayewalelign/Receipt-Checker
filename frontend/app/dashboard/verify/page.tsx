"use client";

import Link from "next/link";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { PROVIDERS } from "@/lib/providers";
import ProviderLogo from "@/components/ProviderLogo";

export default function DashboardVerifyPage() {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Verify Receipt</h1>
          <p className="text-slate-400 text-sm">
            Select a bank or mobile money service to verify a receipt
          </p>
        </div>
      </div>

      {/* PROVIDERS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROVIDERS.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/verify/${p.id}`}
            className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 hover:bg-slate-800/60 transition flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden">
              <ProviderLogo provider={p} size={32} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold truncate">{p.name}</div>
              <div className="text-slate-400 text-sm mt-1">Click to verify</div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
