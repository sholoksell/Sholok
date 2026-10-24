import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Shield, Clock, Heart, Video, LogOut } from "lucide-react";
import { useState } from "react";
import { authApi, channelApi } from "@/lib/api";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, channel, logout, refresh } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">Sign in to view your profile</h2>
        </div>
      </Layout>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile({ displayName });
      // Also update channel name to match displayName
      if (channel) {
        await channelApi.update(channel._id, { name: displayName });
      }
      await refresh();
    } catch {}
    setSaving(false);
  };

  return (
    <Layout>
      <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-24 h-24 rounded-full gradient-primary grid place-items-center text-4xl font-bold text-primary-foreground shadow-glow">
            {user.displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary capitalize">{user.role}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl gradient-card border border-border space-y-4">
            <h2 className="font-bold text-lg">Profile Settings</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block flex items-center gap-2"><User className="w-4 h-4" /> Display Name</label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-background/50" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block flex items-center gap-2"><Mail className="w-4 h-4" /> Email</label>
                <Input value={user.email} disabled className="bg-background/50 opacity-60" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block flex items-center gap-2"><Shield className="w-4 h-4" /> Role</label>
                <Input value={user.role} disabled className="bg-background/50 opacity-60 capitalize" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary border-0 rounded-full font-semibold shadow-glow">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {channel && (
            <div className="p-6 rounded-2xl gradient-card border border-border space-y-3">
              <h2 className="font-bold text-lg">Your Channel</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-primary grid place-items-center text-lg">{channel.avatar || channel.name[0]}</div>
                <div>
                  <p className="font-semibold">{channel.name}</p>
                  <p className="text-xs text-muted-foreground">@{channel.handle} • {channel.subscriberCount} subscribers</p>
                </div>
              </div>
              <Link to={`/channel/${channel._id}`}>
                <Button variant="outline" className="rounded-full mt-2">View Channel</Button>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Link to="/upload" className="p-5 rounded-2xl gradient-card border border-border hover:shadow-glow transition-smooth text-center">
              <Video className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="font-semibold">Upload Video</p>
            </Link>
            <Link to="/" className="p-5 rounded-2xl gradient-card border border-border hover:shadow-glow transition-smooth text-center">
              <Heart className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="font-semibold">Liked Videos</p>
            </Link>
          </div>

          <Button variant="destructive" onClick={logout} className="rounded-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
