"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function QuickVerify() {
  const [ref, setRef] = useState("");

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Quick Verification</h2>

      <div className="flex gap-3">
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="Enter transaction reference"
          className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
        />

        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-xl flex items-center gap-2">
          <Search className="w-4 h-4" />
          Verify
        </button>
      </div>
    </div>
  );
}
