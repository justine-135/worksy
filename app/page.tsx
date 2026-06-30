import CtaSection from "@/components/landing/CtaSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HeroSection from "@/components/landing/HeroSection";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingNavbar from "@/components/landing/LandingNavbar";
import StatsSection from "@/components/landing/StatsSection";
import TestimonialSection from "@/components/landing/TestimonialSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <IntegrationsSection />
        <TestimonialSection />
        <StatsSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
