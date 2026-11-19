import ServiceGrid from "@/components/portal/ServiceGrid";

const HomeHero = () => {
  return (
    <section className="w-full pt-4 pb-0">
      <div className="max-w-[52rem] mx-auto px-4">
        {/* Service shortcuts — search is now in the header only */}
        <ServiceGrid />
      </div>
    </section>
  );
};

export default HomeHero;
