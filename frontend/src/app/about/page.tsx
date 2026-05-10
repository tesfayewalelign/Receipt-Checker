import { Target, Users, Award, Globe } from "lucide-react";

export const metadata = {
  title: "About Us - ReceiptCheck",
  description: "Building the future of payment verification in Ethiopia.",
};

export default function AboutPage() {
  const stats = [
    { value: "500+", label: "Businesses Trust Us" },
    { value: "1M+", label: "Receipts Verified" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "<200ms", label: "Avg Response Time" },
  ];

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description:
        "Our mission is to make payment verification accessible and reliable for every Ethiopian business.",
    },
    {
      icon: Users,
      title: "Customer-First",
      description:
        "We build features based on real customer needs and provide world-class support.",
    },
    {
      icon: Award,
      title: "Quality & Security",
      description:
        "Bank-grade security and rigorous testing ensure your data stays protected.",
    },
    {
      icon: Globe,
      title: "Ethiopian Expertise",
      description:
        "Built by Ethiopians, for Ethiopians. We understand local payment systems deeply.",
    },
  ];

  const team = [
    {
      name: "Yohannes Tefera",
      role: "CEO & Founder",
      specialty: "Fintech & Payments",
    },
    {
      name: "Hana Alemayehu",
      role: "CTO",
      specialty: "AI & Engineering",
    },
    {
      name: "Dawit Bekele",
      role: "Head of Product",
      specialty: "Product Strategy",
    },
    {
      name: "Ruth Tadesse",
      role: "Head of Security",
      specialty: "Cybersecurity",
    },
  ];

  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0A2463] via-[#1e3a8a] to-[#0A2463] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="mx-auto max-w-5xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Building the Future of Payment Verification in Ethiopia
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-blue-100 sm:text-lg lg:text-xl">
            We&apos;re on a mission to eliminate payment fraud and streamline
            verification for Ethiopian businesses through cutting-edge
            technology.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <h2 className="text-3xl font-bold text-emerald-600 sm:text-4xl lg:text-5xl">
                  {stat.value}
                </h2>

                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story + Values */}
      <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Story */}
          <div className="mx-auto mb-20 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Story
            </h2>

            <p className="mt-6 text-base leading-relaxed text-gray-600 sm:text-lg">
              ReceiptCheck was founded in 2024 when we realized Ethiopian
              businesses were losing millions to payment fraud and spending
              countless hours manually verifying receipts.
            </p>

            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
              Today, we help hundreds of businesses verify millions of
              transactions monthly using AI-powered verification and bank-grade
              security.
            </p>
          </div>

          {/* Values */}
          <div>
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Values
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
              {values.map((value, index) => {
                const Icon = value.icon;

                return (
                  <div
                    key={index}
                    className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900">
                      {value.title}
                    </h3>

                    <p className="mt-3 leading-relaxed text-gray-600">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team */}
          <div className="mt-24">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
              Leadership Team
            </h2>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="group text-center transition-all duration-300"
                >
                  <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#0A2463] to-[#1e3a8a] text-3xl font-bold text-white shadow-xl transition-transform duration-300 group-hover:scale-105">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-gray-900">
                    {member.name}
                  </h3>

                  <p className="mt-1 font-medium text-emerald-600">
                    {member.role}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {member.specialty}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-emerald-50 to-cyan-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Join Our Mission
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
            We&apos;re always looking for talented individuals passionate about
            fintech and technology.
          </p>

          <button className="mt-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-emerald-600 hover:to-cyan-600 hover:shadow-xl">
            View Open Positions
          </button>
        </div>
      </section>
    </main>
  );
}
