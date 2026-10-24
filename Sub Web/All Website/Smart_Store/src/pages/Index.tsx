import Hero from "@/components/marketplace/Hero";
import Categories from "@/components/marketplace/Categories";
import AISections from "@/components/marketplace/AISections";
import FlashSale from "@/components/marketplace/FlashSale";
import FeaturedStores from "@/components/marketplace/FeaturedStores";

export default function Index() {
  return (
    <>
      <Hero />
      <Categories />
      <AISections />
      <FlashSale />
      <FeaturedStores />
    </>
  );
}
