import { ArrowRight, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2463] via-[#1e3a8a] to-[#0A2463] text-white">
      {/* Background grid */}
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

      <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6 border border-white/20">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-sm">Trusted by Ethiopian Businesses</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Verify Payments <br />
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Instantly & Securely
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
          Real-time receipt verification API for Telebirr, CBE, and Ethiopian
          banks. Eliminate fraud and automate confirmation.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="group bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105">
            Get API Access
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>

          <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-4 rounded-xl transition-all">
            View Docs
          </button>
        </div>
      </div>
    </section>
  );
}
