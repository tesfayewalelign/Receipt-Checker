import { Upload, Cpu, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Receipt",
      description:
        "Submit payment receipt via API, upload image, or paste transaction reference number.",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Cpu,
      title: "AI Checks Details",
      description:
        "Our AI system extracts data, verifies with bank systems, and runs fraud detection algorithms.",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: CheckCircle,
      title: "Get Verified Result",
      description:
        "Receive instant verification result with transaction details and fraud score in milliseconds.",
      color: "from-blue-500 to-blue-600",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
            How It Works
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to verify any Ethiopian payment receipt
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (Desktop Only) */}
          <div className="hidden md:block absolute top-[90px] left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={index} className="relative group">
                  {/* Card */}
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative z-10">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#0A2463] to-[#1e3a8a] rounded-full flex items-center justify-center text-white shadow-lg font-bold text-sm sm:text-base">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-5 sm:mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-center text-gray-900 font-semibold text-lg sm:text-xl mb-2 sm:mb-3">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-center text-sm sm:text-base text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm sm:text-base">
            Try It Now - Free
          </button>
        </div>
      </div>
    </section>
  );
}
