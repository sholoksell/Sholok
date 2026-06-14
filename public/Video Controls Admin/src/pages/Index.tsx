import { Layout } from "@/components/Layout";
import { CategoryChips } from "@/components/CategoryChips";
import { VideoCard } from "@/components/VideoCard";
import { Play, TrendingUp, Loader2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { videoApi } from "@/lib/api";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [apiVideos, setApiVideos] = useState<any[]>([]);
  const [apiShorts, setApiShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const params: any = { limit: 24, isShort: false };
        const shortsParams: any = { limit: 8, isShort: true };
        if (activeCategory !== "All") {
          params.category = activeCategory;
          shortsParams.category = activeCategory;
        }
        if (searchQuery) {
          params.search = searchQuery;
          shortsParams.search = searchQuery;
        }

        const [videosRes, shortsRes] = await Promise.all([
          videoApi.getAll(params),
          videoApi.getAll(shortsParams),
        ]);
        setApiVideos(videosRes.videos || []);
        setApiShorts(shortsRes.videos || []);
      } catch {
        setApiVideos([]);
        setApiShorts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [activeCategory, searchQuery]);

  // Use only API videos (real uploads)
  const displayVideos = apiVideos.map((v: any) => ({
      id: v._id,
      title: v.title,
      thumbnail: v.thumbnailPath ? videoApi.getThumbnailUrl(v._id) : "",
      channel: v.channel?.name || "Unknown",
      channelAvatar: v.channel?.avatar || v.channel?.name?.[0] || "🎬",
      channelId: v.channel?._id,
      views: `${v.views?.toLocaleString() || 0} views`,
      uploaded: new Date(v.createdAt).toLocaleDateString(),
      duration: v.duration || "0:00",
      category: v.category,
    }));

  const displayShorts = apiShorts.length > 0
    ? apiShorts.map((v: any) => ({
        id: v._id,
        title: v.title,
        thumbnail: v.thumbnailPath ? videoApi.getThumbnailUrl(v._id) : "",
        streamUrl: videoApi.getStreamUrl(v._id),
        channel: v.channel?.name || "Unknown",
        views: `${v.views?.toLocaleString() || 0} views`,
      }))
    : [];

  return (
    <Layout>
      <div className="px-4 md:px-8 pb-16">
        {/* Hero */}
        <section className="relative mt-4 rounded-3xl overflow-hidden shadow-elegant">
          <img src={heroBg} alt="Featured" width={1920} height={500} className="w-full h-[280px] md:h-[420px] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold w-fit border border-primary/30">
              <TrendingUp className="w-3 h-3" /> TRENDING NOW
            </span>
            <h1 className="text-3xl md:text-5xl font-black mt-3 leading-tight">
              Stream the world's <span className="gradient-text">best stories</span>
            </h1>
            <p className="text-muted-foreground mt-3 hidden md:block max-w-lg">
              From blockbuster TV clips to viral shorts. Watch, create, and share — all in one place.
            </p>
            <div className="flex gap-3 mt-5">
              <Link to={displayVideos[0] ? `/watch/${displayVideos[0].id}` : "/watch/v1"}>
                <Button size="lg" className="gradient-primary border-0 shadow-glow rounded-full font-semibold">
                  <Play className="w-4 h-4 fill-current" /> Watch Now
                </Button>
              </Link>
              <Link to="/shorts">
                <Button size="lg" variant="secondary" className="rounded-full font-semibold">Browse Shorts</Button>
              </Link>
            </div>
          </div>
        </section>

        <CategoryChips activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

        {/* Shorts strip — only show if shorts exist */}
        {!loading && displayShorts.length > 0 && (
          <section className="mt-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 rounded-full gradient-primary" />
              <h2 className="text-xl font-bold">Shorts</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {displayShorts.map((s, i) => (
                <Link key={s.id || i} to={`/watch/${s.id}`} className="shrink-0 w-40 md:w-48 group">
                  <div className="aspect-[9/16] rounded-2xl overflow-hidden relative shadow-elegant bg-black">
                    {s.thumbnail ? (
                      <img src={s.thumbnail} alt="" loading="lazy" className="w-full h-full object-cover transition-smooth group-hover:scale-105" />
                    ) : (
                      <video src={s.streamUrl} muted preload="metadata" className="w-full h-full object-cover transition-smooth group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-sm font-semibold text-white line-clamp-2">{s.title}</p>
                      <p className="text-xs text-white/70 mt-1">{s.views}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Recommended grid */}
        {!loading && (
          <section className="mt-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 rounded-full gradient-primary" />
              <h2 className="text-xl font-bold">
                {searchQuery ? `Results for "${searchQuery}"` : activeCategory !== "All" ? activeCategory : "Recommended for you"}
              </h2>
            </div>
            {displayVideos.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No videos found</p>
                <p className="text-sm mt-2">
                  {activeCategory !== "All"
                    ? `No videos in "${activeCategory}" category yet.`
                    : "Be the first to upload a video!"}
                </p>
                <Link to="/upload">
                  <Button className="mt-4 gradient-primary border-0 rounded-full">Upload Video</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {displayVideos.map((v) => <VideoCard key={v.id} video={v} />)}
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Index;
