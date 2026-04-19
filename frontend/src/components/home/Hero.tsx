import { ArrowRight, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#0A2463] via-[#1e3a8a] to-[#0A2463] text-white overflow-hidden">
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

      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-white/20">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">
              Trusted by 500+ Ethiopian Businesses
            </span>
          </div>

          <h1
            className="text-5xl md:text-7xl mb-6 tracking-tight"
            style={{ fontWeight: 700, lineHeight: 1.1 }}
          >
            Verify Ethiopian Payment Receipts{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Instantly
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Secure, real-time receipt verification for CBE, Telebirr, CBE Birr,
            and all major Ethiopian banks. Prevent fraud and automate payment
            confirmation with our developer-friendly API.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 flex items-center justify-center gap-2">
              <span style={{ fontWeight: 600 }}>Get API Access</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-xl border border-white/20 transition-all duration-300 hover:scale-105">
              <span style={{ fontWeight: 600 }}>Start Verifying</span>
            </button>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 items-center text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Free tier available</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>99.9% uptime SLA</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Bank-grade security</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </section>
  );
}
