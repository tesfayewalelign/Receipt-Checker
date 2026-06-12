"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { User, Lock, CheckCircle } from "lucide-react";

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
    }
  };

  /* ───────── UI ───────── */
  if (loading) {
    return <div className="text-white p-10">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-white">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* SUCCESS */}
      {saved && (
        <div className="mb-4 flex items-center gap-2 text-emerald-400">
          <CheckCircle size={18} />
          Saved successfully
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab("profile")}>Profile</button>
        <button onClick={() => setTab("security")}>Security</button>
      </div>

      {/* ───────── PROFILE ───────── */}
      {tab === "profile" && (
        <div className="bg-slate-900 p-6 rounded-xl space-y-4">
          {/* avatar */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
              {profile.name?.trim()?.[0]?.toUpperCase() || "U"}
            </div>

            <div>
              <p className="font-bold">{profile.name}</p>
              <p className="text-slate-400 text-sm">
                {profile.email || "No email found"}
              </p>
            </div>
          </div>

          {/* inputs */}
          <input
            className="w-full p-2 bg-slate-800 rounded"
            placeholder="Full Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />

          <input
            className="w-full p-2 bg-slate-800 rounded"
            placeholder="Company Name"
            value={profile.companyName}
            onChange={(e) =>
              setProfile({ ...profile, companyName: e.target.value })
            }
          />

          <button
            onClick={handleSaveProfile}
            className="bg-emerald-500 px-4 py-2 rounded font-semibold"
          >
            Save Profile
          </button>
        </div>
      )}

      {/* ───────── SECURITY ───────── */}
      {tab === "security" && (
        <div className="bg-slate-900 p-6 rounded-xl space-y-3">
          <input
            type="password"
            placeholder="Current password"
            className="w-full p-2 bg-slate-800 rounded"
            value={passwords.current}
            onChange={(e) =>
              setPasswords({ ...passwords, current: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="New password"
            className="w-full p-2 bg-slate-800 rounded"
            value={passwords.next}
            onChange={(e) =>
              setPasswords({ ...passwords, next: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Confirm password"
            className="w-full p-2 bg-slate-800 rounded"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
          />

          <button
            onClick={handleChangePassword}
            className="bg-red-500 px-4 py-2 rounded font-semibold"
          >
            Update Password
          </button>
        </div>
      )}
    </div>
  );
}
