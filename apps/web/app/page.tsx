import { FeaturesSection } from "../components/features-section";
import { HeroSection } from "../components/hero-section";
import { NavbarLanding } from "../components/navbar-landing";
import { DeveloperShowcase } from "../components/developer-showcase";
import { HowItWorks } from "../components/how-it-works";
import { ExpandingFooter } from "../components/expanding-footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarLanding />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <DeveloperShowcase />
        <HowItWorks />
      </main>
      <ExpandingFooter />
    </div>
  )
}
