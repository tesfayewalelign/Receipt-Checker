import {
  Zap,
  ScanLine,
  Shield,
  Code,
  BarChart3,
  Clock,
  Lock,
  Globe,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Zap,
      title: "Real-time Verification",
      description:
        "Instant payment verification with sub-second response times.",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: ScanLine,
      title: "OCR Receipt Scanning",
      description:
        "AI-powered OCR extracts and verifies receipt data automatically.",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: Shield,
      title: "Fraud Detection",
      description:
        "Machine learning detects suspicious transactions in real time.",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: Code,
      title: "Developer API",
      description: "Clean REST API with SDKs for Node.js, Python, and PHP.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track verifications, success rates, and business insights.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      title: "Fast Response",
      description: "Average API response time under 200ms.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Lock,
      title: "Secure System",
      description: "Bank-grade encryption and secure infrastructure.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Globe,
      title: "Ethiopian Focus",
      description: "Built specifically for Ethiopian payment systems.",
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900">
            Powerful Features
          </h2>

          <p className="mt-4 text-gray-600 text-base sm:text-xl max-w-2xl mx-auto">
            Everything you need to verify payments securely and efficiently
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;

            return (
              <div
                key={i}
                className="p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-gray-900 font-semibold mb-2">{f.title}</h3>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
