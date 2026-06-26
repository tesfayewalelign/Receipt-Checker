"use client";

import { useState } from "react";
import CodeBlock from "./CodeBlock";

export type CodeTab = {
  label: string;
  language: string;
  code: string;
};

export default function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(i)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              i === active
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock code={tabs[active].code} language={tabs[active].language} />
    </div>
  );
}
