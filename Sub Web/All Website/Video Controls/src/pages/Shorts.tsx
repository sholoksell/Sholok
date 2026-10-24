import { Layout } from "@/components/Layout";
import { Heart, MessageCircle, Share2, Music2, Play, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { videoApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Shorts = () => {
  const [apiShorts, setApiShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<Record<string, { likes: number; userReaction: string | null }>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const data = await videoApi.getAll({ limit: 20, isShort: true });
        const videos = data.videos || [];
        setApiShorts(videos);
        const initialReactions: Record<string, { likes: number; userReaction: string | null }> = {};
        videos.forEach((v: any) => {
          initialReactions[v._id] = { likes: v.likes || 0, userReaction: null };
        });
        setReactions(initialReactions);
      } catch {
        setApiShorts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShorts();
  }, []);

  const handleLike = async (videoId: string) => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to sign in to like videos.", variant: "destructive" });
      return;
    }
    try {
      const data = await videoApi.react(videoId, "like");
      setReactions((prev) => ({
        ...prev,
        [videoId]: {
          likes: data.likes,
          userReaction: prev[videoId]?.userReaction === "like" ? null : "like",
        },
      }));
    } catch (err: any) {
      toast({ title: "Failed to like", description: err.message, variant: "destructive" });
    }
  };

  const displayShorts = apiShorts.map((v: any) => ({
      id: v._id,
      title: v.title,
      thumbnail: v.thumbnailPath ? videoApi.getThumbnailUrl(v._id) : "",
      channel: v.channel?.name || "Unknown",
      likes: reactions[v._id]?.likes ?? v.likes ?? 0,
      liked: reactions[v._id]?.userReaction === "like",
      streamUrl: videoApi.getStreamUrl(v._id),
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

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto snap-y snap-mandatory scrollbar-hide">
        {displayShorts.map((s, i) => (
          <section key={s.id} className="snap-start h-[calc(100vh-4rem)] grid place-items-center px-4 py-4">
            <div className="flex items-end gap-4">
              <div className="relative w-[340px] h-full max-h-[85vh] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-elegant group">
                <ShortVideo src={s.streamUrl} poster={s.thumbnail} />
                <div className="absolute bottom-0 inset-x-0 p-5 text-white pointer-events-none">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-full gradient-primary grid place-items-center text-sm font-bold">{s.channel[0]}</div>
                    <span className="font-semibold text-sm">{s.channel}</span>
                    <button className="ml-2 px-3 py-1 text-xs font-semibold rounded-full border border-white/40 hover:bg-white/10 pointer-events-auto">Follow</button>
                  </div>
                  <p className="text-sm font-medium mb-2">{s.title}</p>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <Music2 className="w-3 h-3" /> Original audio • {s.channel}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5 mb-4">
                <button className="flex flex-col items-center gap-1 group" onClick={() => handleLike(s.id)}>
                  <div className={`w-12 h-12 rounded-full grid place-items-center transition-smooth ${s.liked ? "bg-red-500 shadow-glow" : "bg-secondary group-hover:bg-primary group-hover:shadow-glow"}`}>
                    <Heart className={`w-5 h-5 ${s.liked ? "fill-white text-white" : ""}`} />
                  </div>
                  <span className="text-xs font-semibold">{s.likes}</span>
                </button>
                <ActionBtn icon={MessageCircle} label="2.1K" />
                <ActionBtn icon={Share2} label="Share" />
              </div>
            </div>
          </section>
        ))}
      </div>
    </Layout>
  );
};

const ShortVideo = ({ src, poster }: { src: string; poster: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        playsInline
        className="w-full h-full object-cover"
        onClick={togglePlay}
      />
      {!playing && (
        <button onClick={togglePlay} className="absolute inset-0 grid place-items-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md grid place-items-center">
            <Play className="w-7 h-7 fill-white text-white ml-1" />
          </div>
        </button>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
    </>
  );
};

const ActionBtn = ({ icon: Icon, label }: { icon: any; label: string | number }) => (
  <button className="flex flex-col items-center gap-1 group">
    <div className="w-12 h-12 rounded-full bg-secondary grid place-items-center group-hover:bg-primary group-hover:shadow-glow transition-smooth">
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-xs font-semibold">{label}</span>
  </button>
);

export default Shorts;
