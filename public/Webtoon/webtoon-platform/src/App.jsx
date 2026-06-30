import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './layouts/MainLayout';

import HomePage from './pages/HomePage';
import WebtoonDetailPage from './pages/WebtoonDetailPage';
import ReaderPage from './pages/ReaderPage';
import SearchPage from './pages/SearchPage';
import GenresPage from './pages/GenresPage';
import DailyPage from './pages/DailyPage';
import RankingsPage from './pages/RankingsPage';
import FavoritesPage from './pages/FavoritesPage';
import OriginalsPage from './pages/OriginalsPage';
import ChallengePage from './pages/ChallengePage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter basename="/webtoon">
      <AppProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/webtoon/:slug" element={<WebtoonDetailPage />} />
            <Route path="/read/:slug/:episode" element={<ReaderPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/genres" element={<GenresPage />} />
            <Route path="/genres/:genre" element={<GenresPage />} />
            <Route path="/daily" element={<DailyPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/originals" element={<OriginalsPage />} />
            <Route path="/challenge" element={<ChallengePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainLayout>
      </AppProvider>
    </BrowserRouter>
  );
}
