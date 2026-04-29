import Hero from "@/components/home/Hero";
import SupportedProviders from "@/components/home/SupportedProviders";
import Features from "@/components/home/features";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CTA />
      <SupportedProviders />
      <Features />
    </>
  );
}
