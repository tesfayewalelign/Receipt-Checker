import { Shield, Zap, Code } from "lucide-react";

export default function Features() {
  const items = [
    {
      icon: Zap,
      title: "Fast Verification",
      desc: "Instant results in milliseconds",
    },
    {
      icon: Shield,
      title: "Secure System",
      desc: "Bank-grade encryption",
    },
    {
      icon: Code,
      title: "Developer API",
      desc: "Easy integration for any system",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl shadow">
              <Icon className="text-emerald-500 mb-4" />
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
