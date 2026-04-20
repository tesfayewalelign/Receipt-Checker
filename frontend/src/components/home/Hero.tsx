import { ArrowRight, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2463] via-[#1e3a8a] to-[#0A2463] text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-sm">
              Trusted by 500+ Ethiopian Businesses
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-5xl tracking-tight md:text-7xl font-bold leading-tight">
            Verify Ethiopian Payment Receipts{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Instantly
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-3xl text-xl md:text-2xl leading-relaxed text-blue-100">
            Secure, real-time receipt verification for CBE, Telebirr, CBE Birr,
            and all major Ethiopian banks. Prevent fraud and automate payment
            confirmation with our developer-friendly API.
          </p>

          {/* Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button className="group flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:bg-emerald-600 hover:shadow-emerald-500/50">
              Get API Access
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20">
              Start Verifying
            </button>
          </div>

          {/* Features */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>Free tier available</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>99.9% uptime SLA</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>Bank-grade security</span>
            </div>
          </div>
        </div>
      </div>

      {/* bottom fade line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </section>
  );
}
