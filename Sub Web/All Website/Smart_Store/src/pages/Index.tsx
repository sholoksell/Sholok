import HeroSection from "@/components/marketplace/HeroSection";
import PromoBanners from "@/components/marketplace/PromoBanners";
import FlashSale from "@/components/marketplace/FlashSale";
import TrendingSection from "@/components/marketplace/TrendingSection";
import SeasonalBanner from "@/components/marketplace/SeasonalBanner";
import MoreToLove from "@/components/marketplace/MoreToLove";
import OfferPopup from "@/components/marketplace/OfferPopup";
import LiveSearchResults from "@/components/marketplace/LiveSearchResults";
import { useLiveSearch } from "@/store/searchContext";

export default function Index() {
  const { liveQuery } = useLiveSearch();

  return (
    <>
      {liveQuery.trim() ? (
        <LiveSearchResults query={liveQuery.trim()} />
      ) : (
        <>
          <HeroSection />
          <PromoBanners />
          <FlashSale />
          <TrendingSection />
          <SeasonalBanner />
          <MoreToLove />
        </>
      )}
      <OfferPopup />
    </>
  );
}
