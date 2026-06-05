import { Smartphone, Building2, Wallet } from "lucide-react";
import Link from "next/link";

export default function SupportedProviders() {
  const providers = [
    {
      name: "Commercial Bank of Ethiopia",
      abbr: "CBE",
      category: "Bank",
      icon: Building2,
      id: "cbe",
    },
    {
      name: "Telebirr",
      abbr: "Telebirr",
      category: "Mobile Money",
      icon: Smartphone,
      id: "telebirr",
    },
    {
      name: "CBE Birr",
      abbr: "CBE Birr",
      category: "Mobile Money",
      icon: Wallet,
      id: "cbe-birr",
    },
    {
      name: "Bank of Abyssinia",
      abbr: "BoA",
      category: "Bank",
      icon: Building2,
      id: "boa",
    },
    {
      name: "Awash Bank",
      abbr: "Awash",
      category: "Bank",
      icon: Building2,
      id: "awash",
    },
    {
      name: "Dashen Bank",
      abbr: "Dashen",
      category: "Bank",
      icon: Building2,
      id: "dashen",
    },
    {
      name: "M-Pesa Ethiopia",
      abbr: "M-Pesa",
      category: "Mobile Money",
      icon: Smartphone,
      id: "mpesa",
    },
    {
      name: "Other Banks",
      abbr: "15+",
      category: "Supported",
      icon: Building2,
      id: null,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl mb-4 text-gray-900"
            style={{ fontWeight: 700 }}
          >
            Supported Payment Providers
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Verify receipts from all major Ethiopian banks and mobile money
            services
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {providers.map((provider, index) => {
            const Icon = provider.icon;

            const content = (
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0A2463] to-[#1e3a8a] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <div>
                  <div className="text-gray-900" style={{ fontWeight: 600 }}>
                    {provider.abbr}
                  </div>

                  <div className="text-sm text-gray-500 mt-1">
                    {provider.category}
                  </div>
                </div>

                {provider.id && (
                  <div className="mt-2">
                    <span
                      className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"
                      style={{ fontWeight: 600 }}
                    >
                      Click to Verify
                    </span>
                  </div>
                )}
              </div>
            );

            return provider.id ? (
              <Link
                key={index}
                href={`/verify/${provider.id}`}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-emerald-200 group cursor-pointer hover:-translate-y-1"
              >
                {content}
              </Link>
            ) : (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-75"
              >
                {content}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            <span style={{ fontWeight: 600 }}>20+ payment providers</span>{" "}
            supported and growing
          </p>
        </div>
      </div>
    </section>
  );
}
