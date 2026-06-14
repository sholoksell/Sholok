import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import { PlayCircle, Music, BookOpen, Clock, Heart } from "lucide-react";

const Media = () => {
    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
            <Header /> {/* Note: Header might need dark mode adjustment props if strictly enforcing dark theme, but standard works */}

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">

                {/* Featured Video */}
                <section className="mb-12">
                    <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-[21/9] bg-gray-900 group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle className="w-20 h-20 text-white drop-shadow-lg scale-100 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="absolute bottom-0 left-0 p-8 z-30">
                            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded mb-3 inline-block">LIVE NOW</span>
                            <h1 className="text-4xl font-bold mb-2">SpaceX Starship Launch</h1>
                            <p className="text-gray-300 max-w-2xl">Watch the historic launch live from Starbase, Texas as humanity takes another step towards Mars.</p>
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
                    {["All", "Music", "Gaming", "News", "Movies", "Webtoons", "Live"].map((cat, i) => (
                        <button key={i} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${i === 0 ? "bg-white text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Video Grid */}
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><PlayCircle className="w-5 h-5 text-red-500" /> Recommended Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="aspect-video bg-gray-800 rounded-xl mb-3 relative overflow-hidden">
                                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">12:45</span>
                            </div>
                            <h3 className="font-bold line-clamp-2 mb-1 group-hover:text-portal-green transition-colors">Amazing Nature Documentary 4K</h3>
                            <div className="text-sm text-gray-400">
                                <p>NatGeo Wild</p>
                                <p>1.2M views • 2 days ago</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Webtoons Section */}
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-green-500" /> Popular Webtoons</h2>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="aspect-[2/3] bg-gray-800 rounded-xl mb-3 relative overflow-hidden hover:ring-2 ring-green-500 transition-all">
                                <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-black text-xs font-bold rounded">UP</span>
                            </div>
                            <h3 className="font-bold text-sm line-clamp-1 group-hover:text-green-500">Solo Leveling</h3>
                            <p className="text-xs text-gray-400">Fantasy • Action</p>
                        </div>
                    ))}
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default Media;
