import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

const trustItems = [
  "Free tier available",
  "99.9% uptime SLA",
  "Bank-grade security",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2463] via-[#1e3a8a] to-[#0A2463] text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:40px_40px]"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm mb-8">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">
              Trusted by 500+ Ethiopian Businesses
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            Verify Ethiopian Payment Receipts{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Instantly
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-3xl mx-auto text-xl md:text-2xl leading-relaxed text-blue-100 mb-10">
            Secure, real-time receipt verification for CBE, Telebirr, CBE Birr,
            and major Ethiopian banks. Prevent fraud and automate confirmation
            with our developer-friendly API.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/api-docs"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:bg-emerald-600 hover:shadow-emerald-500/50"
            >
              Get API Access
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
            >
              Start Verifying
            </Link>
          </div>

          {/* Trust Points */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-blue-200">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </section>
  );
}
