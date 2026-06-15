"use client";

import Link from "next/link";
import { PROVIDERS } from "@/lib/providers";
import ProviderLogo from "@/components/ProviderLogo";

export default function VerifyPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Choose a Provider
      </h1>

      <p className="text-gray-600 mb-8">
        Select a bank or mobile money service to verify receipt
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {PROVIDERS.map((p) => (
          <Link
            key={p.id}
            href={`/verify/${p.id}`}
            className="bg-white border rounded-xl p-5 hover:border-emerald-400 hover:shadow transition flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
              <ProviderLogo provider={p} size={32} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {p.name}
              </div>
              <div className="text-sm text-gray-500 mt-1">Click to verify</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
