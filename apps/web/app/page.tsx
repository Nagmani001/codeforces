import { FeaturesSection } from "../components/features-section";
import { redirect } from 'next/navigation';
import { HeroSection } from "../components/hero-section";
import { NavbarLanding } from "../components/navbar-landing";
import { DeveloperShowcase } from "../components/developer-showcase";
import { HowItWorks } from "../components/how-it-works";
import { ExpandingFooter } from "../components/expanding-footer";
import { cookies } from "next/headers";
import { authClient } from "../lib/auth";

export default async function Home() {
  const cookie = await cookies();
  console.log("cookies", cookie);
  const { data: session, error } = await authClient.getSession({
    fetchOptions: {
      headers: {
        Cookie: cookie.toString(),
      },
    },
  });

  console.log("session", session);
  console.log("error", error);

  if (session != null) {
    redirect("/problems");
  }
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
