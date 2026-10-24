import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { Bell, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { channelApi, videoApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Channel = () => {
  const { id } = useParams();
  const { user, channel: myChannel } = useAuth();
  const [channel, setChannel] = useState<any>(null);
  const [channelVideos, setChannelVideos] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchChannel = async () => {
      setLoading(true);
      // Use the route param, or fall back to user's own channel
      const channelId = id || myChannel?._id;
      if (!channelId) {
        setChannel(null);
        setChannelVideos([]);
        setLoading(false);
        return;
      }
      try {
        const data = await channelApi.getById(channelId);
        setChannel(data.channel);
        setChannelVideos(data.videos || []);
        setIsSubscribed(data.isSubscribed || false);
      } catch {
        setChannel(null);
        setChannelVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChannel();
  }, [id, myChannel]);

  const handleSubscribe = async () => {
    if (!user || !channel) return;
    try {
      const data = await channelApi.subscribe(channel._id);
      setIsSubscribed(data.subscribed);
      setChannel({ ...channel, subscriberCount: data.subscriberCount });
    } catch {}
  };

  const { toast } = useToast();
  const isOwnChannel = !!(user && channel && (String(channel.owner?._id || channel.owner) === String(user._id)));

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await videoApi.delete(videoId);
      setChannelVideos((prev) => prev.filter((v) => v._id !== videoId));
      toast({ title: "Video deleted successfully" });
    } catch (err: any) {
      toast({ title: "Failed to delete video", description: err.message, variant: "destructive" });
    }
  };

  const handleEditVideo = async (videoId: string, data: { title: string; description: string; category: string }) => {
    try {
      const res = await videoApi.update(videoId, data);
      setChannelVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, ...res.video } : v))
      );
      toast({ title: "Video updated successfully" });
    } catch (err: any) {
      toast({ title: "Failed to update video", description: err.message, variant: "destructive" });
    }
  };

  const displayVideos = channelVideos.map((v: any) => ({
      id: v._id,
      title: v.title,
      thumbnail: v.thumbnailPath ? videoApi.getThumbnailUrl(v._id) : "",
      channel: v.channel?.name || channel?.name || "Unknown",
      channelAvatar: v.channel?.avatar || channel?.name?.[0] || "🎬",
      channelId: v.channel?._id || channel?._id,
      views: `${v.views?.toLocaleString() || 0} views`,
      uploaded: new Date(v.createdAt).toLocaleDateString(),
      duration: v.duration || "0:00",
      category: v.category,
    }));

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const ownerName = channel?.owner?.displayName || channel?.owner?.username;
  const channelName = channel?.name || ownerName || "Unknown";
  const channelHandle = channel?.handle || channel?.owner?.username || "unknown";
  const subscriberCount = channel?.subscriberCount?.toLocaleString() || "0";
  const videoCount = channel?.videoCount || channelVideos.length || 0;
  const channelDesc = channel?.description || "";
  const channelAvatar = channel?.avatar || channelName?.[0]?.toUpperCase() || "🎬";

  return (
    <Layout>
      <div className="pb-16">
        <div className="relative h-40 md:h-60 overflow-hidden">
          <img src={channel?.banner || heroBg} alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="px-4 md:px-8 -mt-8 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-5">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full gradient-primary grid place-items-center text-5xl border-4 border-background shadow-glow">
              {channelAvatar}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{channelName}</h1>
              <p className="text-sm text-muted-foreground mt-1">@{channelHandle} • {subscriberCount} subscribers • {videoCount} videos</p>
              <p className="text-sm mt-2 max-w-2xl">{channelDesc}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubscribe}
                className={`rounded-full font-semibold ${isSubscribed ? "bg-secondary text-foreground" : "gradient-primary border-0 shadow-glow"}`}
              >
                <Bell className="w-4 h-4" /> {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
              <Button variant="secondary" className="rounded-full"><Share2 className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="flex gap-6 mt-8 border-b border-border">
            {["Videos", "Shorts", "Playlists", "Community", "About"].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`pb-3 text-sm font-semibold transition-smooth ${activeTab === i ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {displayVideos.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No videos yet</p>
              <p className="text-sm mt-2">This channel hasn't uploaded any videos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 mt-8">
              {displayVideos.map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  onDelete={isOwnChannel ? handleDeleteVideo : undefined}
                  onEdit={isOwnChannel ? handleEditVideo : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Channel;
