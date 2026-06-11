"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Trash2,
  CheckCircle,
  Camera,
} from "lucide-react";

type Tab = "profile" | "security" | "notifications" | "billing";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "ETB 0",
    limit: "100 req/mo",
    current: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "ETB 499",
    limit: "5,000 req/mo",
    current: true,
  },
  {
    id: "business",
    name: "Business",
    price: "ETB 1,999",
    limit: "50,000 req/mo",
    current: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    limit: "Unlimited",
    current: false,
  },
];

const INVOICES = [
  { id: "INV-2026-06", date: "Jun 1, 2026", amount: "ETB 499", status: "Paid" },
  { id: "INV-2026-05", date: "May 1, 2026", amount: "ETB 499", status: "Paid" },
  { id: "INV-2026-04", date: "Apr 1, 2026", amount: "ETB 499", status: "Paid" },
];

export default function SettingsPage() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "Abebe",
    lastName: "Bikila",
    email: "abebe@example.com",
    phone: "+251911234567",
    company: "Addis Fintech Solutions",
    website: "https://addisfintech.et",
    timezone: "Africa/Addis_Ababa",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [notifs, setNotifs] = useState({
    verificationSuccess: true,
    fraudDetected: true,
    apiKeyCreated: true,
    usageAlerts: true,
    weeklyReport: false,
    productUpdates: false,
  });

  const handleSave = async () => {
    // 👉 later connect backend API here
    // await fetch('/api/settings', { method: 'POST', body: JSON.stringify(...) })

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your account preferences and billing.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === id
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Saved message */}
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-5 text-emerald-400 text-sm font-semibold">
          <CheckCircle className="w-4 h-4" />
          Changes saved successfully.
        </div>
      )}

      {/* PROFILE */}
      {tab === "profile" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl">
                AB
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div>
              <p className="text-white font-bold">Abebe Bikila</p>
              <p className="text-slate-400 text-sm">{profile.email}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {Object.keys(profile).map((key) => (
              <div key={key}>
                <label className="text-slate-400 text-xs">{key}</label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 mt-1 text-sm"
                  value={(profile as any)[key]}
                  onChange={(e) =>
                    setProfile({ ...profile, [key]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-400 px-5 py-2 rounded-xl text-white font-semibold"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* SECURITY */}
      {tab === "security" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold">Change Password</h2>

          {Object.keys(passwords).map((key) => (
            <input
              key={key}
              type="password"
              placeholder={key}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
              value={(passwords as any)[key]}
              onChange={(e) =>
                setPasswords({ ...passwords, [key]: e.target.value })
              }
            />
          ))}

          <button
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-400 px-5 py-2 rounded-xl text-white font-semibold"
          >
            Update Password
          </button>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {tab === "notifications" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">
            Notification Preferences
          </h2>

          {Object.keys(notifs).map((key) => (
            <div
              key={key}
              className="flex justify-between py-3 border-b border-slate-800"
            >
              <span className="text-slate-300 text-sm">{key}</span>

              <button
                onClick={() =>
                  setNotifs({
                    ...notifs,
                    [key]: !notifs[key as keyof typeof notifs],
                  })
                }
                className={`w-11 h-6 rounded-full ${
                  notifs[key as keyof typeof notifs]
                    ? "bg-emerald-500"
                    : "bg-slate-700"
                }`}
              />
            </div>
          ))}

          <button
            onClick={handleSave}
            className="mt-4 bg-emerald-500 px-5 py-2 rounded-xl text-white font-semibold"
          >
            Save Preferences
          </button>
        </div>
      )}

      {/* BILLING */}
      {tab === "billing" && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">Plans</h2>

            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="border border-slate-700 p-4 rounded-xl mb-3"
              >
                <p className="text-white font-bold">{plan.name}</p>
                <p className="text-slate-400 text-sm">{plan.price}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">Invoices</h2>

            {INVOICES.map((inv) => (
              <div key={inv.id} className="flex justify-between py-2">
                <span className="text-slate-300">{inv.id}</span>
                <span className="text-white">{inv.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
