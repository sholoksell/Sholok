import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ThumbsUp, ThumbsDown, Share2, Download, Bookmark, Bell, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VideoCard } from "@/components/VideoCard";
import { useEffect, useState, useRef } from "react";
import { videoApi, commentApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const Watch = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch video from API
        const data = await videoApi.getById(id!);
        setVideo(data.video);
        setUserReaction(data.userReaction);
        setLikes(data.video.likes || 0);
        setDislikes(data.video.dislikes || 0);

        // Fetch comments
        const commentsData = await commentApi.getForVideo(id!);
        setComments(commentsData.comments || []);

        // Fetch suggestions
        const suggestionsData = await videoApi.getAll({ limit: 10 });
        setSuggestions((suggestionsData.videos || []).filter((v: any) => v._id !== id));
      } catch {
        setVideo(null);
        setComments([]);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleReaction = async (type: "like" | "dislike") => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to sign in to like or dislike videos.", variant: "destructive" });
      return;
    }
    try {
      const data = await videoApi.react(id!, type);
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setUserReaction(userReaction === type ? null : type);
    } catch (err: any) {
      toast({ title: "Failed to react", description: err.message, variant: "destructive" });
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to sign in to like comments.", variant: "destructive" });
      return;
    }
    try {
      const data = await commentApi.like(commentId);
      setComments((prev) =>
        prev.map((c) => c._id === commentId ? { ...c, likes: data.likes } : c)
      );
    } catch (err: any) {
      toast({ title: "Failed to like comment", description: err.message, variant: "destructive" });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    try {
      const data = await commentApi.add({ videoId: id!, text: commentText.trim() });
      setComments([{ ...data.comment, replies: [] }, ...comments]);
      setCommentText("");
    } catch {}
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!video) return <Layout><div className="text-center py-20">Video not found</div></Layout>;

  const videoTitle = getLocalizedField(video, "title", language);
  const videoDescription = getLocalizedField(video, "description", language);
  const channelName = video.channel?.name || "Unknown";
  const channelAvatar = video.channel?.avatar || video.channel?.name?.[0] || "🎬";
  const channelId = video.channel?._id || "you";
  const viewCount = `${video.views?.toLocaleString()} views`;
  const uploadDate = new Date(video.createdAt).toLocaleDateString();
  const thumbnailSrc = video.thumbnailPath ? videoApi.getThumbnailUrl(video._id) : "";
  const streamUrl = videoApi.getStreamUrl(video._id);

  return (
    <Layout>
      <div className="px-4 md:px-6 py-6 grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 max-w-[1800px]">
        <div>
          {/* Video Player */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-elegant">
            <video
                ref={videoRef}
                src={streamUrl}
                controls
                autoPlay={video.videoControlsAdmin?.autoplay !== false}
                className="w-full h-full object-contain"
                poster={thumbnailSrc}
              >
                Your browser does not support the video tag.
              </video>
          </div>

          <h1 className="text-xl md:text-2xl font-bold mt-4">{videoTitle}</h1>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-3">
              <Link to={`/channel/${channelId}`} className="w-11 h-11 rounded-full gradient-primary grid place-items-center text-lg">
                {channelAvatar}
              </Link>
              <div>
                <Link to={`/channel/${channelId}`} className="font-semibold hover:text-primary">{channelName}</Link>
                <p className="text-xs text-muted-foreground">
                  {`${video.channel?.subscriberCount?.toLocaleString() || 0} subscribers`}
                </p>
              </div>
              <Button className="gradient-primary border-0 rounded-full font-semibold ml-2 shadow-glow">
                <Bell className="w-4 h-4" /> Subscribe
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-secondary rounded-full overflow-hidden">
                <button
                  onClick={() => handleReaction("like")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-muted transition-smooth ${userReaction === "like" ? "text-primary" : ""}`}
                >
                  <ThumbsUp className={`w-4 h-4 ${userReaction === "like" ? "fill-current" : ""}`} />
                  {likes.toLocaleString()}
                </button>
                <div className="w-px bg-border" />
                <button
                  onClick={() => handleReaction("dislike")}
                  className={`flex items-center px-4 py-2 hover:bg-muted transition-smooth ${userReaction === "dislike" ? "text-primary" : ""}`}
                >
                  <ThumbsDown className={`w-4 h-4 ${userReaction === "dislike" ? "fill-current" : ""}`} />
                </button>
              </div>
              <Button variant="secondary" className="rounded-full"><Share2 className="w-4 h-4" /> Share</Button>
              {video.videoControlsAdmin?.allowDownload && (
                <Button variant="secondary" className="rounded-full"><Download className="w-4 h-4" /> Save</Button>
              )}
              <Button variant="secondary" size="icon" className="rounded-full"><Bookmark className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 p-4 rounded-xl bg-secondary/60">
            <p className="text-sm font-semibold">{viewCount} • {uploadDate}</p>
            <p className="text-sm mt-2 text-foreground/90">
              {videoDescription}
            </p>
            {video.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {video.tags.map((tag: string) => (
                  <span key={tag} className="text-xs text-primary">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <section className="mt-8">
            <h3 className="text-lg font-bold mb-4">
              {`${video.commentCount || comments.length} Comments`}
            </h3>

            {user && (
              <form onSubmit={handleComment} className="flex gap-3 mb-6">
                <div className="w-10 h-10 rounded-full gradient-primary grid place-items-center text-sm font-bold shrink-0">
                  {user.displayName?.[0]?.toUpperCase() || "V"}
                </div>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="rounded-full bg-secondary/50 border-0 flex-1"
                  />
                  <Button type="submit" size="icon" className="rounded-full gradient-primary border-0" disabled={!commentText.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-5">
              {comments.map((c: any) => (
                <div key={c._id || c.id} className="flex gap-3 animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-accent grid place-items-center text-sm font-bold text-accent-foreground shrink-0">
                    {c.user?.displayName?.[0] || c.user?.username?.[0] || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{c.user?.displayName || c.user?.username || "User"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm mt-1">{c.text}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <button onClick={() => handleCommentLike(c._id)} className="flex items-center gap-1 hover:text-primary"><ThumbsUp className="w-3 h-3" /> {c.likes || 0}</button>
                      <button className="hover:text-primary">Reply</button>
                    </div>
                    {/* Nested replies */}
                    {c.replies?.map((reply: any) => (
                      <div key={reply._id} className="flex gap-3 mt-3 ml-2">
                        <div className="w-8 h-8 rounded-full bg-muted grid place-items-center text-xs font-bold shrink-0">
                          {reply.user?.displayName?.[0] || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{reply.user?.displayName || reply.user?.username}</p>
                          <p className="text-sm mt-0.5">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Suggestions */}
        <aside className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Up next</h3>
          {suggestions.map((s: any) => {
            const sId = s._id;
            const sTitle = getLocalizedField(s, "title", language);
            const sThumb = s.thumbnailPath ? videoApi.getThumbnailUrl(s._id) : "";
            const sChannel = s.channel?.name || "Unknown";
            const sViews = `${s.views?.toLocaleString() || 0} views`;
            const sDuration = s.duration || "0:00";
            const sStreamUrl = videoApi.getStreamUrl(s._id);

            return (
              <Link key={sId} to={`/watch/${sId}`} className="flex gap-3 group">
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                  {sThumb ? (
                    <img src={sThumb} alt={sTitle} loading="lazy" className="w-full h-full object-cover transition-smooth group-hover:scale-105" />
                  ) : (
                    <video src={sStreamUrl} muted preload="metadata" className="w-full h-full object-cover" />
                  )}
                  <span className="absolute bottom-1 right-1 text-[10px] px-1 bg-black/85 text-white rounded">{sDuration}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-smooth">{sTitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">{sChannel}</p>
                  <p className="text-xs text-muted-foreground">{sViews}</p>
                </div>
              </Link>
            );
          })}
        </aside>
      </div>
    </Layout>
  );
};

export default Watch;
