import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { Radio, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { videoApi } from "@/lib/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Live = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const data = await videoApi.getAll({ limit: 24, category: "Live" });
        setVideos(data.videos || []);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLive();
  }, []);

  const displayVideos = videos.map((v: any) => ({
    id: v._id,
    title: v.title,
    thumbnail: v.thumbnailPath ? videoApi.getThumbnailUrl(v._id) : "",
    channel: v.channel?.name || "Unknown",
    channelAvatar: v.channel?.avatar || v.channel?.name?.[0] || "🎬",
    views: `${v.views?.toLocaleString() || 0} views`,
    uploaded: new Date(v.createdAt).toLocaleDateString(),
    duration: v.duration || "0:00",
    category: v.category,
  }));

  return (
    <Layout>
      <div className="px-4 md:px-8 pb-16">
        <div className="flex items-center gap-3 mt-6 mb-6">
          <Radio className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-bold">Live</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayVideos.length === 0 ? (
          <div className="text-center py-20">
            <Radio className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold">No live videos yet</p>
            <p className="text-muted-foreground mt-1">Live streams and live content will appear here.</p>
            <Link to="/upload">
              <Button className="mt-4">Upload Video</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {displayVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Live;
