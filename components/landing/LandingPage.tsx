"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NewHeroSection from "./NewHeroSection";
import AboutSection from "./AboutSection";
import NewFeaturesSection from "./NewFeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import NewCallToActionSection from "./NewCallToActionSection";
import NewFooter from "./NewFooter";
import Navbar from "../dashboard/Navbar";
import { auth } from "@/lib/auth";

const LandingPage = () => {
  const { data } = auth.useSession();
  const router = useRouter();

  useEffect(() => {
    if (data?.user) {
      router.push("/dashboard");
    }
  }, [data, router]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      <main id="main-content">
        <NewHeroSection id="hero-section" />
      <AboutSection id="about-section" />
      <NewFeaturesSection id="features-section" />
      <HowItWorksSection id="how-it-works-section" />
      <NewCallToActionSection id="call-to-action-section" />
      </main>
      <NewFooter id="footer-section" />
    </div>
  );
};

export default LandingPage;
