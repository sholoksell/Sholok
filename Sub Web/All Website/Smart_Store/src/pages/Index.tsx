import HeroSection from "@/components/marketplace/HeroSection";
import PromoBanners from "@/components/marketplace/PromoBanners";
import FlashSale from "@/components/marketplace/FlashSale";
import TrendingSection from "@/components/marketplace/TrendingSection";
import SeasonalBanner from "@/components/marketplace/SeasonalBanner";
import MoreToLove from "@/components/marketplace/MoreToLove";
import OfferPopup from "@/components/marketplace/OfferPopup";

export default function Index() {
  return (
    <>
      <HeroSection />
      <PromoBanners />
      <FlashSale />
      <TrendingSection />
      <SeasonalBanner />
      <MoreToLove />
      <OfferPopup />
    </>
  );
}
