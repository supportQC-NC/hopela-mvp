// src/screens/public/LandingScreen.jsx
import { useEffect } from "react";
import Header            from "../../components/layout/Header";
import Footer            from "../../components/layout/Footer";
import LandingMapSection from "../../components/public/LandingMapSection";
import CategoriesCarousel   from "../../components/public/CategoriesCarousel";
import PromotionsCarousel   from "../../components/public/PromotionsCarousel";
import HowItWorksSection from "../../components/public/HowItWorksSection";
import AdvantagesSection from "../../components/public/AdvantagesSection";
import PricingSection    from "../../components/public/PricingSection";
import TestimonialsSection from "../../components/public/TestimonialsSection";
import FinalCta          from "../../components/public/FinalCta";
import LandingHero       from "../../components/public/LandingHero";
import "./LandingScreen.scss";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";

const LandingScreen = () => {
  useEffect(() => {
    if (!document.getElementById("hopela-fonts")) {
      const link = document.createElement("link");
      link.id = "hopela-fonts";
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <main className="lp-root">
      <Header />
      <LandingHero />
      <LandingMapSection />
      <CategoriesCarousel />
      <PromotionsCarousel />
      <HowItWorksSection />
      <AdvantagesSection />
      <PricingSection />
      <TestimonialsSection />
      <FinalCta />
      <Footer />
    </main>
  );
};

export default LandingScreen;