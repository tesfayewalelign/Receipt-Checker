import { Smartphone, Building2, Wallet, LucideIcon } from "lucide-react";

type Provider = {
  name: string;
  abbr: string;
  category: string;
  icon: LucideIcon;
};

export default function SupportedProviders() {
  const providers: Provider[] = [
    {
      name: "Commercial Bank of Ethiopia",
      abbr: "CBE",
      category: "Bank",
      icon: Building2,
    },
    {
      name: "Telebirr",
      abbr: "Telebirr",
      category: "Mobile Money",
      icon: Smartphone,
    },
    {
      name: "CBE Birr",
      abbr: "CBE Birr",
      category: "Mobile Money",
      icon: Wallet,
    },
    {
      name: "Bank of Abyssinia",
      abbr: "BoA",
      category: "Bank",
      icon: Building2,
    },
    { name: "Awash Bank", abbr: "Awash", category: "Bank", icon: Building2 },
    { name: "Dashen Bank", abbr: "Dashen", category: "Bank", icon: Building2 },
    {
      name: "M-Pesa Ethiopia",
      abbr: "M-Pesa",
      category: "Mobile Money",
      icon: Smartphone,
    },
    {
      name: "Other Banks",
      abbr: "15+",
      category: "Supported",
      icon: Building2,
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl md:text-5xl font-bold text-gray-900">
            Supported Payment Providers
          </h2>

          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Verify receipts from all major Ethiopian banks and mobile money
            services
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {providers.map((provider) => {
            const Icon = provider.icon;

            return (
              <div
                key={provider.abbr}
                className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  {/* Icon */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A2463] to-[#1e3a8a] transition-transform group-hover:scale-110">
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Text */}
                  <div>
                    <div className="font-semibold text-gray-900">
                      {provider.abbr}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {provider.category}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center text-gray-600">
          <span className="font-semibold">20+ payment providers</span> supported
          and growing
        </div>
      </div>
    </section>
  );
}
