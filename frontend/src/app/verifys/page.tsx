"use client";

import Link from "next/link";

const providers = [
  { name: "Commercial Bank of Ethiopia", id: "cbe" },
  { name: "Telebirr", id: "telebirr" },
  { name: "CBE Birr", id: "cbe-birr" },
  { name: "Bank of Abyssinia", id: "boa" },
  { name: "Awash Bank", id: "awash" },
  { name: "Dashen Bank", id: "dashen" },
  { name: "M-Pesa Ethiopia", id: "mpesa" },
];

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
        {providers.map((p) => (
          <Link
            key={p.id}
            href={`/verify/${p.id}`}
            className="bg-white border rounded-xl p-5 hover:border-emerald-400 hover:shadow transition"
          >
            <div className="font-semibold text-gray-900">{p.name}</div>
            <div className="text-sm text-gray-500 mt-1">Click to verify</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
