import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { ListVideo, Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { playlistApi, videoApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Playlists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [playlistVideos, setPlaylistVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const fetchPlaylists = async () => {
    try {
      const data = await playlistApi.getAll();
      setPlaylists(data.playlists || []);
    } catch {
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchPlaylists();
  }, [user]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await playlistApi.create({ name: newName.trim() });
      setNewName("");
      setShowCreate(false);
      await fetchPlaylists();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await playlistApi.delete(id);
      if (selectedPlaylist?._id === id) {
        setSelectedPlaylist(null);
        setPlaylistVideos([]);
      }
      await fetchPlaylists();
    } catch {
      // ignore
    }
  };

  const openPlaylist = async (playlist: any) => {
    setSelectedPlaylist(playlist);
    setLoadingVideos(true);
    try {
      const data = await playlistApi.getById(playlist._id);
      setPlaylistVideos(data.playlist?.videos || []);
    } catch {
      setPlaylistVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const displayVideos = playlistVideos
    .filter((v: any) => v && v.status !== "removed")
    .map((v: any) => ({
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

  // Playlist detail view
  if (selectedPlaylist) {
    return (
      <Layout>
        <div className="px-4 md:px-8 pb-16">
          <div className="flex items-center gap-3 mt-6 mb-6">
            <Button variant="ghost" size="icon" onClick={() => { setSelectedPlaylist(null); setPlaylistVideos([]); }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <ListVideo className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">{selectedPlaylist.name}</h1>
            <span className="text-sm text-muted-foreground">{displayVideos.length} videos</span>
          </div>

          {loadingVideos ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : displayVideos.length === 0 ? (
            <div className="text-center py-20">
              <ListVideo className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold">This playlist is empty</p>
              <p className="text-muted-foreground mt-1">Add videos to this playlist from any video page.</p>
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
  }

  // Playlists list view
  return (
    <Layout>
      <div className="px-4 md:px-8 pb-16">
        <div className="flex items-center justify-between mt-6 mb-6">
          <div className="flex items-center gap-3">
            <ListVideo className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Playlists</h1>
          </div>
          {user && (
            <Button size="sm" onClick={() => setShowCreate(!showCreate)} className="gap-2">
              <Plus className="w-4 h-4" /> New Playlist
            </Button>
          )}
        </div>

        {showCreate && (
          <div className="flex gap-2 mb-6 max-w-md">
            <Input
              placeholder="Playlist name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </Button>
          </div>
        )}

        {!user ? (
          <div className="text-center py-20">
            <ListVideo className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold">Sign in to view your playlists</p>
            <p className="text-muted-foreground mt-1">Your playlists will appear here after you sign in.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-20">
            <ListVideo className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold">No playlists yet</p>
            <p className="text-muted-foreground mt-1">Create a playlist to organize your favorite videos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {playlists.map((p) => (
              <div
                key={p._id}
                className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-glow transition-smooth cursor-pointer"
                onClick={() => openPlaylist(p)}
              >
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {p.videos?.length > 0 && p.videos[0]?.thumbnailPath ? (
                    <img
                      src={videoApi.getThumbnailUrl(p.videos[0]._id)}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ListVideo className="w-12 h-12 text-muted-foreground" />
                  )}
                  <div className="absolute bottom-0 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded-tl-lg">
                    {p.videos?.length || 0} videos
                  </div>
                </div>
                <div className="p-3 flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.visibility === "private" ? "Private" : p.visibility === "unlisted" ? "Unlisted" : "Public"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-smooth h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Playlists;
