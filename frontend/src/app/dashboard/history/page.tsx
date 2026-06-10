"use client";

import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/receipts", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => setData(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Receipt History</h1>

      <div className="bg-white rounded-xl shadow">
        {data.map((item) => (
          <div key={item.id} className="p-3 border-b">
            <p>Reference: {item.reference}</p>
            <p>Amount: {item.amount}</p>
            <p>Status: {item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
