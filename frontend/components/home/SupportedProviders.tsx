import Link from "next/link";
import { PROVIDERS } from "@/lib/providers";
import ProviderLogo from "@/components/ProviderLogo";

export default function SupportedProviders() {
  return (
    <section id="providers" className="py-20 bg-gray-50">
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
          {PROVIDERS.map((provider) => (
            <Link
              key={provider.id}
              href={`/verify/${provider.id}`}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-emerald-200 group cursor-pointer hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                  <ProviderLogo provider={provider} size={40} />
                </div>
                <div>
                  <div className="text-gray-900" style={{ fontWeight: 600 }}>
                    {provider.abbr}
                  </div>

                  <div className="text-sm text-gray-500 mt-1">
                    {provider.category}
                  </div>
                </div>

                <div className="mt-2">
                  <span
                    className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"
                    style={{ fontWeight: 600 }}
                  >
                    Click to Verify
                  </span>
                </div>
              </div>
            </Link>
          ))}
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
