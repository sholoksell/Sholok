import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import BackToTop from "./components/common/BackToTop";
import ScrollToTop from "./components/common/ScrollToTop";

import Home from "./pages/Home";
import LiveScore from "./pages/LiveScore";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import ComingSoon from "./pages/ComingSoon";

function App() {
  return (
    <div className="min-h-svh flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live-score" element={<LiveScore />} />
          <Route path="/live-score/:matchId" element={<LiveScore />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:teamId" element={<TeamDetail />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:playerId" element={<PlayerDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:newsId" element={<NewsDetail />} />

          <Route path="/schedule" element={<ComingSoon title="ম্যাচ সময়সূচি" icon="📅" />} />
          <Route path="/league-table" element={<ComingSoon title="লিগ টেবিল" icon="📊" />} />
          <Route path="/videos" element={<ComingSoon title="ভিডিও" icon="🎬" />} />
          <Route path="/analysis" element={<ComingSoon title="বিশ্লেষণ" icon="🧠" />} />
          <Route path="/fan-zone" element={<ComingSoon title="ফ্যান জোন" icon="🎉" />} />
          <Route path="/search" element={<ComingSoon title="সার্চ" icon="🔍" />} />
          <Route path="/weather" element={<ComingSoon title="আবহাওয়া" icon="☁️" />} />
          <Route path="*" element={<ComingSoon title="পেজ খুঁজে পাওয়া যায়নি" icon="❓" />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export default App;
