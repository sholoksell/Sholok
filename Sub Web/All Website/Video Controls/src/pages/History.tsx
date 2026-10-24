import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { History as HistoryIcon, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { historyApi, videoApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const History = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchHistory = async () => {
      try {
        const data = await historyApi.getAll();
        setVideos(data.videos || []);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const handleClear = async () => {
    try {
      await historyApi.clear();
      setVideos([]);
    } catch {
      // ignore
    }
  };

  const displayVideos = videos.map((v: any, index: number) => ({
    id: v._id,
    title: v.title,
    thumbnail: v.thumbnailPath ? videoApi.getThumbnailUrl(v._id) : "",
    channel: v.channel?.name || "Unknown",
    channelAvatar: v.channel?.avatar || v.channel?.name?.[0] || "🎬",
    views: `${v.views?.toLocaleString() || 0} views`,
    uploaded: new Date(v.watchedAt || v.createdAt).toLocaleDateString(),
    duration: v.duration || "0:00",
    category: v.category,
    _key: `${v._id}-${index}`,
  }));

  return (
    <Layout>
      <div className="px-4 md:px-8 pb-16">
        <div className="flex items-center justify-between mt-6 mb-6">
          <div className="flex items-center gap-3">
            <HistoryIcon className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Watch History</h1>
          </div>
          {videos.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear} className="gap-2">
              <Trash2 className="w-4 h-4" /> Clear History
            </Button>
          )}
        </div>

        {!user ? (
          <div className="text-center py-20">
            <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold">Sign in to view your watch history</p>
            <p className="text-muted-foreground mt-1">Your watch history will appear here after you sign in.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayVideos.length === 0 ? (
          <div className="text-center py-20">
            <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold">No watch history yet</p>
            <p className="text-muted-foreground mt-1">Videos you watch will appear here.</p>
            <Link to="/">
              <Button className="mt-4">Browse Videos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayVideos.map((v) => (
              <VideoCard key={v._key} video={v} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default History;
