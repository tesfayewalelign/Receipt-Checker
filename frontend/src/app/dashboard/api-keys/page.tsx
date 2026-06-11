"use client";
import { useState } from "react";
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Shield,
} from "lucide-react";

interface APIKey {
  id: string;
  name: string;
  key: string;
  type: "live" | "test";
  created: string;
  lastUsed: string;
  requests: number;
  status: "active" | "revoked";
}

const initialKeys: APIKey[] = [
  {
    id: "1",
    name: "Production Key",
    key: "rck_live_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r8a3f",
    type: "live",
    created: "Apr 18, 2026",
    lastUsed: "2 hours ago",
    requests: 1247,
    status: "active",
  },
  {
    id: "2",
    name: "Staging Key",
    key: "rck_test_9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i2b9c",
    type: "test",
    created: "Apr 15, 2026",
    lastUsed: "1 day ago",
    requests: 84,
    status: "active",
  },
  {
    id: "3",
    name: "Mobile App Key",
    key: "rck_live_zz9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i1h2a1b",
    type: "live",
    created: "Mar 2, 2026",
    lastUsed: "3 days ago",
    requests: 312,
    status: "active",
  },
];

function mask(key: string) {
  return key.slice(0, 14) + "••••••••••••••••••••••••" + key.slice(-4);
}

function randomKey(type: "live" | "test") {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const rand = Array.from(
    { length: 40 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  return `rck_${type}_${rand}`;
}

export default function APIKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>(initialKeys);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyType, setNewKeyType] = useState<"live" | "test">("test");
  const [justCreated, setJustCreated] = useState<APIKey | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const copy = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateKey = () => {
    if (!newKeyName.trim()) return;
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: randomKey(newKeyType),
      type: newKeyType,
      created: "Jun 11, 2026",
      lastUsed: "Never",
      requests: 0,
      status: "active",
    };
    setKeys((k) => [newKey, ...k]);
    setJustCreated(newKey);
    setShowModal(false);
    setNewKeyName("");
  };

  const revokeKey = (id: string) => {
    setKeys((k) =>
      k.map((key) => (key.id === id ? { ...key, status: "revoked" } : key)),
    );
    setDeleteConfirm(null);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-white"
            style={{ fontWeight: 700, fontSize: "1.5rem" }}
          >
            API Keys
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage authentication keys for API access.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Generate New Key
        </button>
      </div>

      {/* Just-created banner */}
      {justCreated && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-emerald-300 text-sm" style={{ fontWeight: 600 }}>
              New key created — copy it now!
            </p>
            <p className="text-emerald-400/70 text-xs mt-0.5">
              This is the only time you'll see the full key. Store it securely.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-300 truncate">
                {justCreated.key}
              </code>
              <button
                onClick={() => copy("new", justCreated.key)}
                className="shrink-0 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {copied === "new" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <button
            onClick={() => setJustCreated(null)}
            className="text-emerald-500 hover:text-emerald-300 text-xs shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Security tip */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-blue-300 text-sm">
          <span style={{ fontWeight: 600 }}>Security reminder:</span> Never
          expose API keys in client-side code or version control. Use
          environment variables or a secrets manager.
        </p>
      </div>

      {/* Keys list */}
      <div className="space-y-4">
        {keys.map((k) => (
          <div
            key={k.id}
            className={`bg-slate-900 border rounded-2xl p-6 transition-colors ${
              k.status === "revoked"
                ? "border-slate-800 opacity-60"
                : "border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    k.type === "live" ? "bg-emerald-500/15" : "bg-amber-500/15"
                  }`}
                >
                  <Key
                    className={`w-4.5 h-4.5 ${k.type === "live" ? "text-emerald-400" : "text-amber-400"}`}
                    style={{ width: "1.125rem", height: "1.125rem" }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white" style={{ fontWeight: 600 }}>
                      {k.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        k.type === "live"
                          ? "text-emerald-400 bg-emerald-500/15"
                          : "text-amber-400 bg-amber-500/15"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {k.type === "live" ? "Live" : "Test"}
                    </span>
                    {k.status === "revoked" && (
                      <span
                        className="text-xs text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full"
                        style={{ fontWeight: 600 }}
                      >
                        Revoked
                      </span>
                    )}
                    {k.status === "active" && (
                      <span
                        className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full"
                        style={{ fontWeight: 600 }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Created {k.created}
                  </p>
                </div>
              </div>
              {k.status === "active" && (
                <div className="flex items-center gap-2">
                  <button
                    title="Rotate key"
                    className="p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(k.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Key value */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center min-w-0">
                <code className="text-sm font-mono text-slate-300 truncate">
                  {visible[k.id] ? k.key : mask(k.key)}
                </code>
              </div>
              <button
                onClick={() => setVisible((v) => ({ ...v, [k.id]: !v[k.id] }))}
                className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                {visible[k.id] ? (
                  <EyeOff
                    className="w-4.5 h-4.5"
                    style={{ width: "1.125rem", height: "1.125rem" }}
                  />
                ) : (
                  <Eye
                    className="w-4.5 h-4.5"
                    style={{ width: "1.125rem", height: "1.125rem" }}
                  />
                )}
              </button>
              {k.status === "active" && (
                <button
                  onClick={() => copy(k.id, k.key)}
                  className="p-2.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {copied === k.id ? (
                    <CheckCircle
                      className="w-4.5 h-4.5 text-emerald-400"
                      style={{ width: "1.125rem", height: "1.125rem" }}
                    />
                  ) : (
                    <Copy
                      className="w-4.5 h-4.5"
                      style={{ width: "1.125rem", height: "1.125rem" }}
                    />
                  )}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span>
                Last used: <span className="text-slate-400">{k.lastUsed}</span>
              </span>
              <span>•</span>
              <span>
                <span className="text-slate-400" style={{ fontWeight: 600 }}>
                  {k.requests.toLocaleString()}
                </span>{" "}
                requests this month
              </span>
            </div>

            {/* Revoke confirm */}
            {deleteConfirm === k.id && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm flex-1">
                  Revoking this key will immediately break any integration using
                  it. Are you sure?
                </p>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="text-slate-400 text-sm hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => revokeKey(k.id)}
                  className="text-red-400 text-sm hover:text-white bg-red-500/20 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Revoke
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Generate key modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h2
              className="text-white mb-1"
              style={{ fontWeight: 700, fontSize: "1.125rem" }}
            >
              Generate New API Key
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Give your key a name and select environment.
            </p>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-slate-300 text-sm mb-1.5"
                  style={{ fontWeight: 600 }}
                >
                  Key Name
                </label>
                <input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Mobile App Production"
                  className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label
                  className="block text-slate-300 text-sm mb-1.5"
                  style={{ fontWeight: 600 }}
                >
                  Environment
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["test", "live"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewKeyType(t)}
                      className={`px-4 py-2.5 rounded-xl border text-sm transition-all ${
                        newKeyType === t
                          ? t === "live"
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                            : "border-amber-500 bg-amber-500/15 text-amber-400"
                          : "border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {t === "live" ? "🟢 Live" : "🟡 Test"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={generateKey}
                disabled={!newKeyName.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm transition-colors"
                style={{ fontWeight: 600 }}
              >
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
