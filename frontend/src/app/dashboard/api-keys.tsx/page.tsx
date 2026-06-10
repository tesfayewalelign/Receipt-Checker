"use client";

import { useEffect, useState } from "react";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch keys
  const fetchKeys = async () => {
    const res = await fetch("http://localhost:5000/api/dashboard/api-keys", {
      credentials: "include",
    });

    const data = await res.json();
    setKeys(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  // create key
  const createKey = async () => {
    const res = await fetch("http://localhost:5000/api/apikey/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: "My API Key",
      }),
    });

    const data = await res.json();
    alert("API Key Created!");
    fetchKeys();
  };

  // revoke key
  const revokeKey = async (id: number) => {
    await fetch(`http://localhost:5000/api/apikey/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchKeys();
  };

  // copy key
  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    alert("Copied to clipboard!");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">API Keys</h1>

        <button
          onClick={createKey}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
        >
          + Create Key
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {keys.length === 0 ? (
            <p className="p-4 text-gray-500">No API keys found</p>
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 border-b"
              >
                {/* Key Info */}
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="text-sm text-gray-500">
                    {key.key.slice(0, 12)}...****
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      key.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {key.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => copyKey(key.key)}
                    className="px-3 py-1 bg-gray-100 rounded"
                  >
                    Copy
                  </button>

                  <button
                    onClick={() => revokeKey(key.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
