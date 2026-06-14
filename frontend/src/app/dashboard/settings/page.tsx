"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import {
  User,
  Lock,
  CheckCircle,
  Building2,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

type Tab = "profile" | "security";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // PROFILE
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    companyName: "",
    image: "",
  });

  // PASSWORD
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  /* ───────── LOAD PROFILE ───────── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // 1. Get session (Better Auth)
        const session = await authClient.getSession();

        // 2. Get backend profile (DB extra data)
        const res = await fetch("http://localhost:5000/api/dashboard/profile", {
          credentials: "include",
        });

        const data = await res.json();

        // 3. MERGE BOTH (IMPORTANT)
        setProfile({
          name: session?.data?.user?.name || data.name || "New User",
          email: session?.data?.user?.email || data.email || "",
          companyName: data.company || "",
          image: session?.data?.user?.image || data.image || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ───────── SAVE PROFILE ───────── */
  const handleSaveProfile = async () => {
    try {
      if (!profile.name.trim()) {
        alert("Name is required");
        return;
      }

      setSavingProfile(true);

      const res = await fetch("http://localhost:5000/api/dashboard/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          companyName: profile.companyName,
          image: profile.image,
        }),
      });

      if (!res.ok) throw new Error("Profile update failed");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Profile update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  /* ───────── CHANGE PASSWORD ───────── */
  const handleChangePassword = async () => {
    try {
      if (!passwords.current || !passwords.next) {
        alert("Fill all password fields");
        return;
      }

      if (passwords.next !== passwords.confirm) {
        alert("Passwords do not match");
        return;
      }

      setSavingPassword(true);

      const res = await fetch(
        "http://localhost:5000/api/dashboard/change-password",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwords.current,
            newPassword: passwords.next,
          }),
        },
      );

      if (!res.ok) throw new Error("Password update failed");

      setSaved(true);
      setPasswords({ current: "", next: "", confirm: "" });

      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Password update failed");
    } finally {
      setSavingPassword(false);
    }
  };

  /* ───────── UI ───────── */
  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight mb-2">
            Settings
          </h1>
          <p className="text-sm text-slate-500">
            Manage your account profile and security preferences.
          </p>
        </div>

        {/* SUCCESS TOAST */}
        {saved && (
          <div className="mb-5 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-lg px-3.5 py-2.5">
            <CheckCircle size={16} />
            Saved successfully
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-1 mb-6 bg-[#11141a] border border-white/[0.06] rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("profile")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === "profile"
                ? "bg-white/[0.08] text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <User size={14} />
            Profile
          </button>
          <button
            onClick={() => setTab("security")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === "security"
                ? "bg-white/[0.08] text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Lock size={14} />
            Security
          </button>
        </div>

        {loading ? (
          <div className="bg-[#11141a] border border-white/[0.06] rounded-xl p-6 animate-pulse space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/[0.06]" />
              <div className="space-y-2">
                <div className="h-3.5 w-32 bg-white/[0.06] rounded" />
                <div className="h-3 w-44 bg-white/[0.04] rounded" />
              </div>
            </div>
            <div className="h-10 bg-white/[0.04] rounded-lg" />
            <div className="h-10 bg-white/[0.04] rounded-lg" />
          </div>
        ) : (
          <>
            {/* ───────── PROFILE ───────── */}
            {tab === "profile" && (
              <div className="bg-[#11141a] border border-white/[0.06] rounded-xl p-6 space-y-6">
                {/* avatar */}
                <div className="flex items-center gap-4 pb-6 border-b border-white/[0.06]">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-[#0a0c10] font-semibold text-lg shrink-0">
                    {profile.name?.trim()?.[0]?.toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {profile.name}
                    </p>
                    <p className="text-slate-500 text-sm truncate">
                      {profile.email || "No email found"}
                    </p>
                  </div>
                </div>

                {/* inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Full name
                    </label>
                    <div className="relative">
                      <User
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#0a0c10] border border-white/[0.08] rounded-lg text-sm placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                        placeholder="Full name"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        disabled
                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#0a0c10]/60 border border-white/[0.06] rounded-lg text-sm text-slate-500 cursor-not-allowed"
                        value={profile.email || "No email found"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Company name
                    </label>
                    <div className="relative">
                      <Building2
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#0a0c10] border border-white/[0.08] rounded-lg text-sm placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                        placeholder="Company name"
                        value={profile.companyName}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            companyName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 disabled:cursor-not-allowed text-[#0a0c10] text-sm font-medium rounded-lg transition-colors"
                  >
                    {savingProfile && (
                      <span className="w-3.5 h-3.5 border-2 border-[#0a0c10]/30 border-t-[#0a0c10] rounded-full animate-spin" />
                    )}
                    {savingProfile ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ───────── SECURITY ───────── */}
            {tab === "security" && (
              <div className="bg-[#11141a] border border-white/[0.06] rounded-xl p-6 space-y-6">
                <div>
                  <h2 className="text-sm font-medium mb-1">Change password</h2>
                  <p className="text-xs text-slate-500">
                    Choose a strong password you don't use elsewhere.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Current password
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#0a0c10] border border-white/[0.08] rounded-lg text-sm placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                        value={passwords.current}
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            current: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        New password
                      </label>
                      <div className="relative">
                        <Lock
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                          type={showPasswords ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-[#0a0c10] border border-white/[0.08] rounded-lg text-sm placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                          value={passwords.next}
                          onChange={(e) =>
                            setPasswords({ ...passwords, next: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Confirm new password
                      </label>
                      <div className="relative">
                        <Lock
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                          type={showPasswords ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-[#0a0c10] border border-white/[0.08] rounded-lg text-sm placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                          value={passwords.confirm}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              confirm: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPasswords((s) => !s)}
                    type="button"
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showPasswords ? "Hide passwords" : "Show passwords"}
                  </button>
                </div>

                <div className="flex justify-end pt-2 border-t border-white/[0.06] -mx-6 px-6 pb-0 mt-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={savingPassword}
                    className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-white text-[#0a0c10] hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium rounded-lg transition-colors"
                  >
                    {savingPassword && (
                      <span className="w-3.5 h-3.5 border-2 border-[#0a0c10]/30 border-t-[#0a0c10] rounded-full animate-spin" />
                    )}
                    {savingPassword ? "Updating..." : "Update password"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
