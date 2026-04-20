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

type Feature = {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
};

export default function Features() {
  const features: Feature[] = [
    {
      icon: Zap,
      title: "Real-time Verification",
      description:
        "Instant payment verification with sub-second response times. Get results immediately.",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: ScanLine,
      title: "OCR Receipt Scanning",
      description:
        "Advanced AI-powered OCR to extract and verify payment details from receipt images.",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: Shield,
      title: "Fraud Detection",
      description:
        "Machine learning algorithms detect suspicious patterns and prevent fraudulent transactions.",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: Code,
      title: "REST API for Developers",
      description:
        "Clean, well-documented API with SDKs for Python, Node.js, PHP, and more.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: BarChart3,
      title: "Dashboard Analytics",
      description:
        "Comprehensive analytics dashboard to track verifications, success rates, and trends.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      title: "Fast Response Time",
      description:
        "Average API response time under 200ms. Built for scale and performance.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Lock,
      title: "Secure & Encrypted",
      description:
        "Bank-grade encryption, SOC 2 compliant infrastructure, and data protection.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Globe,
      title: "Ethiopian-First",
      description:
        "Built specifically for Ethiopian payment systems with local infrastructure.",
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4 text-gray-900 font-bold">
            Powerful Features for Every Business
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to verify payments securely and efficiently
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="group p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-gray-900 mb-2 font-semibold">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
