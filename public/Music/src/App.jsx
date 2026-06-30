import { Routes, Route, Navigate } from 'react-router-dom'
import { useMusic } from './context/MusicContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import ArtistPage from './pages/ArtistPage'
import AlbumPage from './pages/AlbumPage'
import PlaylistPage from './pages/PlaylistPage'
import Charts from './pages/Charts'
import CategoryPage from './pages/CategoryPage'
import LyricsPage from './pages/LyricsPage'
import FloatingPlayer from './components/player/FloatingPlayer'

export default function App() {
  const { theme } = useMusic()

  return (
    <div className={theme === 'dark' ? 'dark' : 'light'}>
      <div className="min-h-screen bg-bangla-dark text-white font-bangla">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/artist/:id" element={<ArtistPage />} />
            <Route path="/album/:id" element={<AlbumPage />} />
            <Route path="/playlist/:id" element={<PlaylistPage />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/lyrics" element={<LyricsPage />} />
            {/* Catch-all: redirect any unmatched path to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        <FloatingPlayer />
      </div>
    </div>
  )
}
