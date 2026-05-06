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
    <section className="bg-gray-50 py-14 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 sm:mb-12 md:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Supported Payment Providers
          </h2>

          <p className="mt-4 mx-auto max-w-xl sm:max-w-2xl text-base sm:text-lg md:text-xl text-gray-600">
            Verify receipts from all major Ethiopian banks and mobile money
            services
          </p>
        </div>

        {/* Grid */}
        <div
          className="
          grid 
          grid-cols-2 
          sm:grid-cols-3 
          md:grid-cols-4 
          lg:grid-cols-4 
          gap-4 sm:gap-5 md:gap-6
        "
        >
          {providers.map((provider) => {
            const Icon = provider.icon;

            return (
              <div
                key={provider.abbr}
                className="
                  group cursor-pointer 
                  rounded-xl sm:rounded-2xl 
                  border border-gray-100 
                  bg-white 
                  p-4 sm:p-5 md:p-6 
                  shadow-sm 
                  transition-all duration-300 
                  hover:-translate-y-1 
                  hover:border-emerald-200 
                  hover:shadow-lg
                "
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
                  {/* Icon */}
                  <div
                    className="
                    flex items-center justify-center 
                    h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14
                    rounded-lg sm:rounded-xl
                    bg-gradient-to-br from-[#0A2463] to-[#1e3a8a] 
                    transition-transform group-hover:scale-110
                  "
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                  </div>

                  {/* Text */}
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-gray-900">
                      {provider.abbr}
                    </div>
                    <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">
                      {provider.category}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-8 sm:mt-10 md:mt-12 text-center text-sm sm:text-base text-gray-600">
          <span className="font-semibold">20+ payment providers</span> supported
          and growing
        </div>
      </div>
    </section>
  );
}
