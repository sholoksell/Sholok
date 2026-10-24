import { Layout } from "@/components/Layout";
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { videoApi } from "@/lib/api";
import { shorts as mockShorts, type Short } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Shorts = () => {
  const [displayShorts, setDisplayShorts] = useState<Short[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reactions, setReactions] = useState<Record<string, { likes: number; liked: boolean }>>({});
  const { user } = useAuth();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const data = await videoApi.getAll({ limit: 20, isShort: true });
        const videos = data.videos || [];
        if (videos.length === 0) throw new Error("empty");
        const mapped: Short[] = videos.map((v: any) => ({
          id: v._id,
          title: v.title,
          thumbnail: v.thumbnailPath ? videoApi.getThumbnailUrl(v._id) : "",
          channel: v.channel?.name || "Unknown",
          likes: String(v.likes || 0),
          duration: v.duration || "0:00",
          videoUrl: videoApi.getStreamUrl(v._id),
        }));
        setDisplayShorts(mapped);
        const init: Record<string, { likes: number; liked: boolean }> = {};
        mapped.forEach((s) => { init[s.id] = { likes: parseInt(s.likes) || 0, liked: false }; });
        setReactions(init);
      } catch {
        setDisplayShorts(mockShorts);
        const init: Record<string, { likes: number; liked: boolean }> = {};
        mockShorts.forEach((s) => { init[s.id] = { likes: parseInt(s.likes) || 0, liked: false }; });
        setReactions(init);
      }
    };
    fetchShorts();
  }, []);

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(displayShorts.length - 1, idx));
    setActiveIndex(clamped);
    const el = containerRef.current?.children[clamped] as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [displayShorts.length]);

  const handleLike = async (id: string) => {
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to like videos.", variant: "destructive" });
      return;
    }
    setReactions((prev) => ({
      ...prev,
      [id]: { likes: prev[id].liked ? prev[id].likes - 1 : prev[id].likes + 1, liked: !prev[id].liked },
    }));
    try { await videoApi.react(id, "like"); } catch {}
  };

  if (displayShorts.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-muted-foreground">
          <span className="text-5xl">📹</span>
          <p className="font-semibold">Loading Shorts…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        ref={containerRef}
        className="h-[calc(100vh-4rem)] overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        onScroll={(e) => {
          const el = e.currentTarget;
          const idx = Math.round(el.scrollTop / el.clientHeight);
          setActiveIndex(idx);
        }}
      >
        {displayShorts.map((s, i) => (
          <section key={s.id} className="snap-start h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-4">
            <div className="flex items-end gap-4">
              {/* Video player */}
              <div className="relative w-[320px] md:w-[360px] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-elegant">
                <ShortPlayer
                  src={s.videoUrl}
                  poster={s.thumbnail}
                  active={i === activeIndex}
                />
                {/* Info overlay */}
                <div className="absolute bottom-10 left-0 right-0 px-5 pb-1 text-white pointer-events-none">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full gradient-primary grid place-items-center text-sm font-bold">
                      {s.channel[0]}
                    </div>
                    <span className="font-semibold text-sm drop-shadow">{s.channel}</span>
                  </div>
                  <p className="text-sm font-medium drop-shadow leading-snug">{s.title}</p>
                  <p className="text-xs text-white/60 mt-1">{s.duration}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-4 mb-16">
                <ActionBtn
                  icon={Heart}
                  label={formatCount(reactions[s.id]?.likes ?? 0)}
                  active={reactions[s.id]?.liked}
                  activeClass="bg-red-500 shadow-glow"
                  onClick={() => handleLike(s.id)}
                />
                <ActionBtn icon={MessageCircle} label="Comments" />
                <ActionBtn icon={Share2} label="Share" />
                {/* Navigation */}
                <button
                  onClick={() => goTo(i - 1)}
                  disabled={i === 0}
                  className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center disabled:opacity-30 hover:bg-primary hover:shadow-glow transition-smooth"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => goTo(i + 1)}
                  disabled={i === displayShorts.length - 1}
                  className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center disabled:opacity-30 hover:bg-primary hover:shadow-glow transition-smooth"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        ))}
      </div>
    </Layout>
  );
};

// ── Per-short video player ──────────────────────────────────────────────────

interface ShortPlayerProps {
  src: string;
  poster: string;
  active: boolean;
}

const ShortPlayer = ({ src, poster, active }: ShortPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [errored, setErrored] = useState(false);

  // Auto-play / pause when this card enters/leaves viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.muted = true;
      setMuted(true);
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [active]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) { video.pause(); setPlaying(false); }
    else { video.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * video.duration;
  };

  return (
    <div className="relative w-full h-full" onClick={togglePlay}>
      {errored ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-zinc-900">
          {poster && <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
          <span className="text-4xl relative z-10">🎬</span>
          <p className="text-white/80 text-xs text-center px-4 relative z-10">Video unavailable in preview</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop
          muted={muted}
          playsInline
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setErrored(true)}
        />
      )}

      {/* Top controls */}
      <div className="absolute top-3 right-3 z-20 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={toggleMute}
          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Play/pause indicator */}
      {!playing && !errored && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 pointer-events-none z-[5]" />

      {/* Progress bar — clickable */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/25 z-20 cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-red-500 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// ── Helper components ───────────────────────────────────────────────────────

interface ActionBtnProps {
  icon: React.ElementType;
  label: string | number;
  active?: boolean;
  activeClass?: string;
  onClick?: () => void;
}

const ActionBtn = ({ icon: Icon, label, active, activeClass = "", onClick }: ActionBtnProps) => (
  <button className="flex flex-col items-center gap-1 group" onClick={onClick}>
    <div className={`w-12 h-12 rounded-full grid place-items-center transition-smooth ${
      active ? activeClass : "bg-secondary group-hover:bg-primary group-hover:shadow-glow"
    }`}>
      <Icon className={`w-5 h-5 ${active ? "fill-white text-white" : ""}`} />
    </div>
    <span className="text-xs font-semibold">{label}</span>
  </button>
);

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export default Shorts;
