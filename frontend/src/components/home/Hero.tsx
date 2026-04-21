import { ArrowRight, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-[#0A2463] to-[#1e3a8a] text-white py-24">
      <div className="max-w-5xl mx-auto text-center px-6">
        <div className="flex justify-center mb-6">
          <span className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
            <CheckCircle size={16} /> Trusted in Ethiopia
          </span>
        </div>

        <h1 className="text-5xl font-bold mb-6">Verify Payments Instantly</h1>

        <p className="text-lg text-blue-100 mb-8">
          Secure receipt verification for CBE, Telebirr, and all Ethiopian
          banks.
        </p>

        <button className="bg-emerald-500 px-6 py-3 rounded-lg flex items-center gap-2 mx-auto hover:bg-emerald-600">
          Get Started <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
