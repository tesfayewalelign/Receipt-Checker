"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  ShieldCheck,
  Terminal,
  ArrowRight,
  Building2,
} from "lucide-react";
import CodeTabs from "./CodeTabs";
import CodeBlock from "./CodeBlock";
import MethodBadge from "./MethodBadge";
import {
  API_BASE_URL,
  VERIFY_PATH,
  REQUEST_PARAMS,
  BANK_FIELDS,
  RESPONSE_FIELDS,
  ERROR_ROWS,
  CURL_SAMPLE,
  JS_SAMPLE,
  JS_FILE_SAMPLE,
  SUCCESS_RESPONSE_SAMPLE,
  ERROR_RESPONSE_SAMPLE,
} from "./endpoints";

const SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "authentication", label: "Authentication" },
  { id: "api-key", label: "Get an API Key" },
  { id: "verify", label: "Verify Endpoint" },
  { id: "banks", label: "Banks & Fields" },
  { id: "response", label: "Response" },
  { id: "errors", label: "Errors" },
];

// Stable reference so the scroll-spy effect doesn't reconnect every render.
const SECTION_IDS = SECTIONS.map((s) => s.id);

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export default function ApiDocs() {
  const active = useScrollSpy(SECTION_IDS);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A2463] to-[#1e3a8a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium">
            <Terminal className="w-4 h-4" /> API Reference
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold">
            Receipt Verification API
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-blue-100">
            Verify bank and mobile-money receipts from Ethiopian providers with a
            single HTTP request. Authenticate with your API key, send a
            transaction reference or upload a receipt, and get back structured
            transaction data.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black/20 px-4 py-2 font-mono text-sm">
            <span className="text-emerald-300">Base URL</span>
            <span className="text-blue-100">{API_BASE_URL}</span>
          </div>
        </div>
      </section>

      {/* Body: sidebar + content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-56 lg:flex-shrink-0">
            <nav className="lg:sticky lg:top-24 self-start">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                On this page
              </p>
              <ul className="space-y-1">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        active === s.id
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-16">
            {/* Introduction */}
            <section id="introduction" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
              <p className="mt-3 text-gray-600 leading-relaxed">
                The Receipt Verification API lets your system confirm that a
                payment was really made. You send a transaction reference (or
                upload the receipt itself), and the API fetches the official
                record from the provider, parses it, and returns normalized
                transaction details — payer, receiver, amount, date and more.
              </p>
              <div className="mt-5 grid sm:grid-cols-3 gap-4">
                {[
                  { step: "1", title: "Get a key", text: "Create an API key from your dashboard." },
                  { step: "2", title: "Send a request", text: "POST a receipt reference or file." },
                  { step: "3", title: "Get the data", text: "Receive structured transaction details." },
                ].map((c) => (
                  <div
                    key={c.step}
                    className="p-5 rounded-2xl border border-gray-200 bg-white"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-white flex items-center justify-center text-sm font-bold">
                      {c.step}
                    </div>
                    <h3 className="mt-3 font-semibold text-gray-900">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{c.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="scroll-mt-24">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Authentication
                </h2>
              </div>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Every request to the API must include your secret API key in the{" "}
                <code className="px-1.5 py-0.5 rounded bg-gray-100 text-emerald-700 font-mono text-sm">
                  x-api-key
                </code>{" "}
                header. Requests without a valid, active key are rejected.
              </p>
              <div className="mt-4">
                <CodeBlock
                  language="HTTP header"
                  code={`x-api-key: YOUR_API_KEY`}
                />
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Keep your key secret — send requests from your server, never from
                untrusted client-side code.
              </p>
            </section>

            {/* Get an API Key */}
            <section id="api-key" className="scroll-mt-24">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Get an API Key
                </h2>
              </div>
              <ol className="mt-4 space-y-3">
                {[
                  "Sign in to your ReceiptCheck account.",
                  "Open the dashboard and go to API Keys.",
                  "Click Create, give the key a name, and copy the generated secret.",
                ].map((text, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                      {i + 1}
                    </span>
                    <span className="text-gray-600">{text}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                The full secret is shown only once at creation time. Store it
                securely — if you lose it, revoke the key and create a new one.
              </div>
              <Link
                href="/dashboard/api-keys"
                className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 rounded-xl text-white font-semibold hover:scale-105 transition"
              >
                Manage API Keys <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

            {/* Verify Endpoint */}
            <section id="verify" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Verify a Receipt
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <MethodBadge method="POST" />
                <code className="font-mono text-sm text-gray-800 break-all">
                  {VERIFY_PATH}
                </code>
              </div>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Send the request body as{" "}
                <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-sm">
                  application/json
                </code>{" "}
                or, when uploading a receipt file, as{" "}
                <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-sm">
                  multipart/form-data
                </code>
                .
              </p>

              {/* Parameters */}
              <h3 className="mt-8 text-lg font-semibold text-gray-900">
                Body parameters
              </h3>
              <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Field</th>
                      <th className="px-4 py-2.5 font-medium">Type</th>
                      <th className="px-4 py-2.5 font-medium">Required</th>
                      <th className="px-4 py-2.5 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {REQUEST_PARAMS.map((p) => (
                      <tr key={p.name} className="align-top">
                        <td className="px-4 py-3 font-mono text-emerald-700 whitespace-nowrap">
                          {p.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {p.type}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={
                              p.required === "Required"
                                ? "text-red-600 font-medium"
                                : "text-gray-400"
                            }
                          >
                            {p.required}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {p.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Request samples */}
              <h3 className="mt-8 text-lg font-semibold text-gray-900">
                Example request
              </h3>
              <div className="mt-3">
                <CodeTabs
                  tabs={[
                    { label: "cURL", language: "bash", code: CURL_SAMPLE },
                    { label: "JavaScript", language: "javascript", code: JS_SAMPLE },
                    {
                      label: "JavaScript (file upload)",
                      language: "javascript",
                      code: JS_FILE_SAMPLE,
                    },
                  ]}
                />
              </div>

              {/* Success response */}
              <h3 className="mt-8 text-lg font-semibold text-gray-900">
                Example response
              </h3>
              <div className="mt-3">
                <CodeBlock language="json" code={SUCCESS_RESPONSE_SAMPLE} />
              </div>
            </section>

            {/* Banks & Fields */}
            <section id="banks" className="scroll-mt-24">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Banks &amp; Fields
                </h2>
              </div>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Set the{" "}
                <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-sm">
                  type
                </code>{" "}
                field to the provider you are verifying. Each provider needs a
                slightly different set of fields:
              </p>
              <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">type</th>
                      <th className="px-4 py-2.5 font-medium">Provider</th>
                      <th className="px-4 py-2.5 font-medium">Required fields</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {BANK_FIELDS.map((b) => (
                      <tr key={b.type}>
                        <td className="px-4 py-3 font-mono text-emerald-700 whitespace-nowrap">
                          {b.type}
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {b.label}
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                          {b.required}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Instead of a reference you can upload the receipt as a{" "}
                <code className="px-1 py-0.5 rounded bg-gray-100 font-mono">
                  file
                </code>{" "}
                (PDF or image); the reference is extracted automatically.
              </p>
            </section>

            {/* Response */}
            <section id="response" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Response Schema
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">
                A successful call returns{" "}
                <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-sm">
                  success: true
                </code>{" "}
                and a{" "}
                <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-sm">
                  data
                </code>{" "}
                object with these fields:
              </p>
              <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Field</th>
                      <th className="px-4 py-2.5 font-medium">Type</th>
                      <th className="px-4 py-2.5 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {RESPONSE_FIELDS.map((f) => (
                      <tr key={f.name}>
                        <td className="px-4 py-3 font-mono text-emerald-700 whitespace-nowrap">
                          {f.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {f.type}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {f.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Field availability depends on what the provider exposes — values
                that cannot be parsed are returned as{" "}
                <code className="px-1 py-0.5 rounded bg-gray-100 font-mono">
                  null
                </code>
                .
              </p>
            </section>

            {/* Errors */}
            <section id="errors" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">Errors</h2>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Errors return the matching HTTP status with{" "}
                <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-sm">
                  success: false
                </code>{" "}
                and a{" "}
                <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-sm">
                  message
                </code>
                .
              </p>
              <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 font-medium">message</th>
                      <th className="px-4 py-2.5 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ERROR_ROWS.map((e, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-mono font-semibold text-gray-800 whitespace-nowrap">
                          {e.status}
                        </td>
                        <td className="px-4 py-3 font-mono text-red-600">
                          {e.message}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{e.when}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <CodeBlock language="json" code={ERROR_RESPONSE_SAMPLE} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
