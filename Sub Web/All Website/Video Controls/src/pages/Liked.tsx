import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { ThumbsUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { videoApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Liked = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchLiked = async () => {
      try {
        const data = await videoApi.getLiked();
        setVideos(data.videos || []);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLiked();
  }, [user]);

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
          <ThumbsUp className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Liked Videos</h1>
          {videos.length > 0 && (
            <span className="text-sm text-muted-foreground ml-2">{videos.length} videos</span>
          )}
        </div>

        {!user ? (
          <div className="text-center py-20">
            <ThumbsUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold">Sign in to view liked videos</p>
            <p className="text-muted-foreground mt-1">Your liked videos will appear here after you sign in.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayVideos.length === 0 ? (
          <div className="text-center py-20">
            <ThumbsUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold">No liked videos yet</p>
            <p className="text-muted-foreground mt-1">Videos you like will appear here.</p>
            <Link to="/">
              <Button className="mt-4">Browse Videos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Liked;
