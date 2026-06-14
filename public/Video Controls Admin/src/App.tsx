import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Watch from "./pages/Watch.tsx";
import Shorts from "./pages/Shorts.tsx";
import Channel from "./pages/Channel.tsx";
import Upload from "./pages/Upload.tsx";
import Admin from "./pages/Admin.tsx";
import Profile from "./pages/Profile.tsx";
import History from "./pages/History.tsx";
import Liked from "./pages/Liked.tsx";
import Playlists from "./pages/Playlists.tsx";
import Trending from "./pages/Trending.tsx";
import Live from "./pages/Live.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/tv">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/shorts" element={<Shorts />} />
            <Route path="/channel" element={<Channel />} />
            <Route path="/channel/:id" element={<Channel />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/live" element={<Live />} />
            <Route path="/history" element={<History />} />
            <Route path="/liked" element={<Liked />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
