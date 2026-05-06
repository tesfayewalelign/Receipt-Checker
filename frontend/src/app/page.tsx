import Hero from "@/components/home/Hero";
import SupportedProviders from "@/components/home/SupportedProviders";
import Features from "@/components/home/features";
import HowItWorks from "@/components/home/HowItWorks";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SupportedProviders />
      <Features />
      <HowItWorks />
    </>
  );
}
