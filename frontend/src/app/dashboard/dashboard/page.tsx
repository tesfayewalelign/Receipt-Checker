"use client";

import {
  Key,
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
} from "lucide-react";

import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const [showProductionKey, setShowProductionKey] = useState(false);
  const [showTestKey, setShowTestKey] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert("API key copied!");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* HEADER */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Welcome back, Abebe 👋
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {[
            {
              title: "Verifications",
              value: "1,247",
              icon: CheckCircle,
              color: "emerald",
              badge: "+12%",
            },
            {
              title: "Success Rate",
              value: "98.5%",
              icon: TrendingUp,
              color: "blue",
              badge: "Good",
            },
            {
              title: "Avg Response",
              value: "178ms",
              icon: Activity,
              color: "amber",
              badge: "Fast",
            },
            {
              title: "Fraud Detected",
              value: "3",
              icon: AlertCircle,
              color: "purple",
              badge: "Low",
            },
          ].map((item, i) => {
            const Icon = item.icon;

            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center bg-${item.color}-100`}
                  >
                    <Icon className={`w-5 h-5 text-${item.color}-600`} />
                  </div>

                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                </div>

                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {item.value}
                </div>
                <p className="text-sm text-gray-600">{item.title}</p>
              </div>
            );
          })}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* API KEYS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">
                      API Keys
                    </h2>
                    <p className="text-sm text-gray-500">
                      Manage authentication keys
                    </p>
                  </div>
                </div>

                <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                  Generate Key
                </button>
              </div>

              {/* KEYS */}
              <div className="space-y-4">
                {/* Production */}
                <div className="border rounded-xl p-4 hover:shadow-sm transition">
                  <div className="flex justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Production Key
                      </p>
                      <p className="text-xs text-gray-500">Active</p>
                    </div>

                    <button
                      onClick={() => setShowProductionKey(!showProductionKey)}
                    >
                      {showProductionKey ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 p-2 rounded text-xs sm:text-sm">
                      {showProductionKey
                        ? "rck_live_xxxxxxxxxxxxxxxxx"
                        : "rck_live_••••••••••••••••"}
                    </code>

                    <button
                      onClick={() => copyToClipboard("rck_live_xxxxxxxxx")}
                    >
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Test */}
                <div className="border rounded-xl p-4">
                  <div className="flex justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">Test Key</p>
                      <p className="text-xs text-gray-500">Testing</p>
                    </div>

                    <button onClick={() => setShowTestKey(!showTestKey)}>
                      {showTestKey ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 p-2 rounded text-xs sm:text-sm">
                      {showTestKey
                        ? "rck_test_xxxxxxxxxxxxxxxxx"
                        : "rck_test_••••••••••••••••"}
                    </code>

                    <button onClick={() => copyToClipboard("rck_test_xxx")}>
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* SECURITY NOTE */}
              <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm text-gray-700">
                🔒 Never expose API keys publicly. Use environment variables.
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* PLAN */}
            <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white rounded-2xl p-6">
              <h3 className="font-bold text-lg">Free Plan</h3>
              <p className="text-sm opacity-90 mb-4">100 verifications/month</p>

              <Link href="/pricing">
                <button className="w-full bg-white text-emerald-600 font-semibold py-2 rounded-xl">
                  Upgrade
                </button>
              </Link>
            </div>

            {/* QUICK LINKS */}
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="font-bold mb-4">Quick Links</h3>

              <div className="space-y-3 text-sm">
                <Link href="/api-docs" className="block hover:text-emerald-600">
                  API Docs →
                </Link>
                <Link
                  href="/analytics"
                  className="block hover:text-emerald-600"
                >
                  Analytics →
                </Link>
                <Link href="/support" className="block hover:text-emerald-600">
                  Support →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
