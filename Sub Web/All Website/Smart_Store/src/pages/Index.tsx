import HeroSection from "@/components/marketplace/HeroSection";
import ServiceHighlights from "@/components/marketplace/ServiceHighlights";
import PromoBanners from "@/components/marketplace/PromoBanners";
import FlashSale from "@/components/marketplace/FlashSale";
import FavouriteFitBanner from "@/components/marketplace/FavouriteFitBanner";
import MoreToLove from "@/components/marketplace/MoreToLove";
import OfferPopup from "@/components/marketplace/OfferPopup";

export default function Index() {
  return (
    <>
      <HeroSection />
      <ServiceHighlights />
      <PromoBanners />
      <FlashSale />
      <FavouriteFitBanner />
      <MoreToLove />
      <OfferPopup />
    </>
  );
}
