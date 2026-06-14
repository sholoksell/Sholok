import { Search, Menu, Mic, Bell, Upload, LogOut, User, Check, CheckCheck, Trash2, Heart, MessageSquare, UserPlus, Video } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { useState, useEffect, useCallback } from "react";
import { notificationApi } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Header = () => {
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }
    try {
      const data = await notificationApi.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch { /* ignore */ }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setNotifLoading(true);
    try {
      const data = await notificationApi.getAll({ limit: 30 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { /* ignore */ }
    setNotifLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (notifOpen) fetchNotifications();
  }, [notifOpen, fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const handleDeleteNotif = async (id: string) => {
    try {
      const wasUnread = notifications.find(n => n._id === id && !n.read);
      await notificationApi.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleClearAll = async () => {
    try {
      await notificationApi.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const notifIcon = (type: string) => {
    switch (type) {
      case "like": return <Heart className="w-4 h-4 text-red-400" />;
      case "comment": case "reply": return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case "subscribe": return <UserPlus className="w-4 h-4 text-green-400" />;
      case "new_video": return <Video className="w-4 h-4 text-purple-400" />;
      default: return <Bell className="w-4 h-4 text-yellow-400" />;
    }
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-background/85 backdrop-blur-xl border-b border-border flex items-center px-3 md:px-6 gap-3 md:gap-6">
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" className="lg:flex hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 rounded-xl gradient-primary grid place-items-center shadow-glow group-hover:animate-pulse-glow">
              <span className="text-lg font-black italic text-primary-foreground leading-none" style={{ fontFamily: "'Segoe UI','Arial Black',sans-serif" }}>S</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block tracking-tight">Sholok Watching</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 flex justify-center max-w-2xl mx-auto">
          <div className="flex items-center w-full">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, channels, creators..."
                className="pl-11 h-11 rounded-l-full rounded-r-none border-r-0 bg-secondary/50 focus-visible:ring-primary/40"
              />
            </div>
            <Button type="submit" size="icon" className="h-11 w-14 rounded-l-none rounded-r-full bg-secondary hover:bg-secondary/80 text-foreground border border-l-0 border-input">
              <Search className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="ml-2 h-11 w-11 rounded-full bg-secondary hidden md:inline-flex">
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {user && (user.role === "creator" || user.role === "admin") && (
            <Link to="/upload">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Upload className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <div className="flex gap-1">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleMarkAllRead}>
                      <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={handleClearAll}>
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </div>
              <ScrollArea className="max-h-[400px]">
                {!user ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Sign in to see your notifications
                  </div>
                ) : notifLoading ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                        onClick={() => {
                          if (!n.read) handleMarkRead(n._id);
                          if (n.video) {
                            navigate(`/watch/${n.video._id || n.video}`);
                            setNotifOpen(false);
                          } else if (n.channel) {
                            navigate(`/channel/${n.channel._id || n.channel}`);
                            setNotifOpen(false);
                          }
                        }}
                      >
                        <div className="mt-0.5 shrink-0">{notifIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!n.read ? "font-medium" : "text-muted-foreground"}`}>
                            {n.title}
                          </p>
                          {n.message && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.message}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {!n.read && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }}>
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteNotif(n._id); }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full gradient-primary grid place-items-center text-sm font-bold text-primary-foreground shadow-glow">
                  {user.displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="font-semibold">{user.displayName || user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-primary mt-1 capitalize">{user.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile"><User className="w-4 h-4 mr-2" /> Profile</Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setAuthOpen(true)} className="gradient-primary border-0 rounded-full font-semibold shadow-glow text-sm">
              Sign In
            </Button>
          )}
        </div>
      </header>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};
