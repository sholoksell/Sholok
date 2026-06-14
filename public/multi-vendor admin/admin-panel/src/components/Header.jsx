import { Menu, ExternalLink, LogOut, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  return (
    <header className="sticky top-0 z-30 bg-[#16162a]/80 backdrop-blur-md border-b border-[#2a2a4a] px-6 h-14 flex items-center gap-4">
      <button onClick={onMenuClick} className="text-slate-400 hover:text-slate-200 transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* Smart Store link */}
      <a href="http://localhost:8080" target="_blank" rel="noreferrer"
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-primary-400 transition-colors border border-[#2a2a4a] rounded-lg px-3 py-1.5">
        <ExternalLink className="w-3.5 h-3.5" />
        View Store
      </a>

      <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* Avatar */}
      <div className="flex items-center gap-2.5">
        <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full border border-primary-500/30" />
        <div className="hidden md:block">
          <p className="text-sm font-medium text-slate-200 leading-none">{user?.name}</p>
          <p className="text-xs text-slate-500 mt-0.5 capitalize">{user?.role}</p>
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors ml-1">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
