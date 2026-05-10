import Features from "@/components/home/features";
import { CheckCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Features - ReceiptCheck",
  description:
    "Powerful features for modern businesses - real-time verification, OCR scanning, fraud detection, and more.",
};

export default function FeaturesPage() {
  const useCases = [
    {
      title: "E-commerce Platforms",
      description:
        "Automatically verify customer payments and reduce manual confirmation time by 95%",
      benefits: [
        "Instant order confirmation",
        "Reduced fraud",
        "Better customer experience",
      ],
    },
    {
      title: "Fintech Applications",
      description:
        "Build trust with real-time transaction verification and fraud detection",
      benefits: [
        "Real-time verification",
        "Compliance ready",
        "Scalable infrastructure",
      ],
    },
    {
      title: "Marketplaces",
      description:
        "Verify vendor and buyer transactions across multiple payment providers",
      benefits: [
        "Multi-provider support",
        "Automated reconciliation",
        "Dispute resolution",
      ],
    },
    {
      title: "Subscription Services",
      description:
        "Verify recurring payments and manage subscription billing efficiently",
      benefits: [
        "Recurring payment checks",
        "Payment tracking",
        "Automated renewals",
      ],
    },
  ];

  return (
    <div className="pt-0 ">
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#0A2463] via-[#1e3a8a] to-[#0A2463] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight">
            Powerful Features for Modern Businesses
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-blue-100 max-w-2xl mx-auto">
            Everything you need to verify payments, prevent fraud, and scale
            your business
          </p>
        </div>
      </section>

      {/* FEATURES COMPONENT */}
      <section className="bg-white py-12 sm:py-20">
        <Features />
      </section>

      {/* USE CASES */}
      <section className="bg-gray-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900">
              Use Cases
            </h2>
            <p className="mt-3 text-gray-600 text-base sm:text-xl max-w-2xl mx-auto">
              See how businesses like yours use our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {useCases.map((item, i) => (
              <div
                key={i}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-gray-600 text-sm sm:text-base">
                  {item.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {item.benefits.map((b, j) => (
                    <li key={j} className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <span className="text-gray-700 text-sm sm:text-base">
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-emerald-50 to-cyan-50 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Ready to Get Started?
          </h2>

          <p className="mt-4 text-gray-600 text-base sm:text-xl">
            Join 500+ Ethiopian businesses already using ReceiptCheck
          </p>

          <button className="mt-8 inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:scale-105 transition">
            Get API Access Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
