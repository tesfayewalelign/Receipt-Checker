import Image from "next/image";
import { Building2, Smartphone } from "lucide-react";
import type { Provider } from "@/lib/providers";

/**
 * Renders a provider's logo, or a category icon when no logo asset exists.
 *
 * Keeping the fallback here (instead of an <Image> that 404s on a missing
 * file) is what stops the dev server from logging repeated image-optimizer
 * errors for providers like M-Pesa that don't have a logo yet.
 */
export default function ProviderLogo({
  provider,
  size = 40,
  className = "",
}: {
  provider: Pick<Provider, "logo" | "name" | "category">;
  size?: number;
  className?: string;
}) {
  if (provider.logo) {
    return (
      <Image
        src={provider.logo}
        alt={provider.name}
        width={size}
        height={size}
        className={`object-contain ${className}`}
      />
    );
  }

  const Icon = provider.category === "Mobile Money" ? Smartphone : Building2;
  return (
    <Icon
      style={{ width: size * 0.7, height: size * 0.7 }}
      className={`text-gray-600 ${className}`}
    />
  );
}
