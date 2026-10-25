import SearchBar from "@/components/portal/SearchBar";
import ServiceGrid from "@/components/portal/ServiceGrid";

const HomeHero = () => {
  return (
    <section className="w-full pt-7 pb-0">
      <div className="max-w-[52rem] mx-auto px-4">
        {/* Brand */}
        <div className="text-center mb-5">
          <a href="/home" className="select-none group">
            <span className="text-5xl sm:text-6xl font-black text-primary tracking-tight group-hover:opacity-90 transition-opacity">
              Sholok
            </span>
          </a>
        </div>

        {/* Hero search — clean wide bar + options toolbar below */}
        <SearchBar hero />

        {/* Service shortcuts */}
        <ServiceGrid />
      </div>
    </section>
  );
};

export default HomeHero;
