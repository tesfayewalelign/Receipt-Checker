"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Copy, Trash2, Plus, Key, Check, AlertTriangle, X } from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  key?: string;
  status: string;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [newKeyName, setNewKeyName] = useState("");

  // 🔥 one-time secret key modal
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // copy feedback + delete confirmation
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedModal, setCopiedModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  /* ───────── LOAD KEYS ───────── */
  useEffect(() => {
    const loadKeys = async () => {
      try {
        setLoading(true);

        const session = await authClient.getSession();
        if (!session?.user) return;

        const res = await fetch("http://localhost:5000/api/keys", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        setKeys(data || []);
      } catch (err) {
        console.error("Failed loading keys", err);
      } finally {
        setLoading(false);
      }
    };

    loadKeys();
  }, []);

  /* ───────── CREATE KEY ───────── */
  const createKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      setCreating(true);

      const res = await fetch("http://localhost:5000/api/keys/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Create failed");

      // update list
      setKeys((prev) => [data.data, ...prev]);

      // 🔥 SHOW KEY ONLY ONCE (IMPORTANT)
      setCreatedKey(data.secret);
      setShowModal(true);

      setNewKeyName("");
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  /* ───────── DELETE KEY ───────── */
  const deleteKey = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/keys/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      setKeys((prev) => prev.filter((k) => k.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* ───────── COPY ───────── */
  const copyKey = (key?: string, id?: string) => {
    if (!key) return;
    navigator.clipboard.writeText(key);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const copyModalKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedModal(true);
    setTimeout(() => setCopiedModal(false), 1500);
  };

  /* ───────── MASK KEY ───────── */
  const maskKey = (key?: string) => {
    if (!key) return "—";
    return key.slice(0, 6) + "••••••••••••" + key.slice(-4);
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  /* ───────── UI ───────── */
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Key size={16} className="text-emerald-400" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">API Keys</h1>
        </div>
        <p className="text-sm text-slate-500">
          Manage keys that authenticate requests to the API. Keep them secret —
          anyone with a key can act on your behalf.
        </p>
      </div>

      {/* CREATE BOX */}
      <div className="bg-[#11141a] border border-white/[0.06] rounded-xl p-4 mb-6">
        <label className="block text-xs font-medium text-slate-400 mb-2">
          New key name
        </label>
        <div className="flex gap-2.5">
          <input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKey()}
            placeholder="e.g. Production server"
            className="flex-1 px-3.5 py-2.5 bg-[#0a0c10] border border-white/[0.08] rounded-lg text-sm placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
          />

          <button
            onClick={createKey}
            disabled={creating || !newKeyName.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 disabled:cursor-not-allowed text-[#0a0c10] text-sm font-medium rounded-lg transition-colors"
          >
            {creating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#0a0c10]/30 border-t-[#0a0c10] rounded-full animate-spin" />
                Creating
              </>
            ) : (
              <>
                <Plus size={16} strokeWidth={2.5} />
                Create key
              </>
            )}
          </button>
        </div>
      </div>

      {/* KEY LIST */}
      <div className="bg-[#11141a] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <span className="text-xs font-medium text-slate-400">
            {loading
              ? "Loading…"
              : `${keys.length} key${keys.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.06]">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="px-4 py-4 flex items-center justify-between animate-pulse"
              >
                <div className="space-y-2">
                  <div className="h-3.5 w-32 bg-white/[0.06] rounded" />
                  <div className="h-3 w-44 bg-white/[0.04] rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-white/[0.04] rounded-lg" />
                  <div className="w-8 h-8 bg-white/[0.04] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="px-4 py-12 flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.04] mb-3">
              <Key size={18} className="text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">No keys yet</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Create a key above to start making authenticated requests.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {keys.map((key) => (
              <div
                key={key.id}
                className="px-4 py-3.5 flex items-center justify-between gap-4 group hover:bg-white/[0.015] transition-colors"
              >
                {/* LEFT */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{key.name}</p>
                    <span
                      className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                        key.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-500/10 text-slate-400"
                      }`}
                    >
                      {key.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <code className="font-mono">{maskKey(key.key)}</code>
                    <span className="text-slate-700">·</span>
                    <span>Created {formatDate(key.createdAt)}</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => copyKey(key.key, key.id)}
                    title="Copy key"
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    {copiedId === key.id ? (
                      <Check size={15} className="text-emerald-400" />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>

                  {confirmDeleteId === key.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteKey(key.id)}
                        className="px-2.5 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-400 text-white rounded-lg transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(key.id)}
                      title="Revoke key"
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ───────── MODAL (SHOW KEY ONCE) ───────── */}
      {showModal && createdKey && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#11141a] border border-white/[0.08] p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Check size={16} className="text-emerald-400" />
              </div>
              <h2 className="text-base font-semibold">Key created</h2>
            </div>

            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Copy this key now and store it somewhere safe. For your security,
              you won't be able to see it again.
            </p>

            {/* KEY BOX */}
            <div className="mt-4 p-3 bg-[#0a0c10] border border-white/[0.06] rounded-lg flex items-center justify-between gap-3">
              <code className="text-emerald-300 break-all text-sm font-mono leading-relaxed">
                {createdKey}
              </code>

              <button
                onClick={() => copyModalKey(createdKey)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium rounded-lg transition-colors"
              >
                {copiedModal ? (
                  <>
                    <Check size={13} className="text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy
                  </>
                )}
              </button>
            </div>

            {/* WARNING */}
            <div className="mt-3 flex items-start gap-2 text-xs text-amber-400/90 bg-amber-500/[0.06] border border-amber-500/10 rounded-lg px-3 py-2.5">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>
                This key won't be shown again. Make sure it's saved before
                closing this dialog.
              </span>
            </div>

            {/* CLOSE */}
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-white text-[#0a0c10] hover:bg-slate-200 py-2.5 text-sm font-medium rounded-lg transition-colors"
            >
              I've saved my key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
