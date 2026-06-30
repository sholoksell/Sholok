import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { songs } from '../data/songs';

const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('sb_volume') || '0.8'));
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(() => localStorage.getItem('sb_shuffle') === 'true');
  const [repeat, setRepeat] = useState(() => localStorage.getItem('sb_repeat') || 'none'); // none | one | all
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('sb_liked') || '[]');
      return songs.length > 0 ? stored.filter(s => songs.some(x => x.id === s.id)) : [];
    } catch { return []; }
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('sb_recent') || '[]');
      return songs.length > 0 ? stored.filter(s => songs.some(x => x.id === s.id)) : [];
    } catch { return []; }
  });
  const [savedAlbums, setSavedAlbums] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb_albums') || '[]'); } catch { return []; }
  });
  const [savedArtists, setSavedArtists] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb_artists') || '[]'); } catch { return []; }
  });
  const [savedPlaylists, setSavedPlaylists] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb_playlists') || '[]'); } catch { return []; }
  });
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb_search_history') || '[]'); } catch { return []; }
  });
  const [showPlayer, setShowPlayer] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('sb_theme') || 'dark');
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => handleSongEnd();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
    localStorage.setItem('sb_volume', volume.toString());
  }, [volume, isMuted]);

  useEffect(() => {
    localStorage.setItem('sb_shuffle', shuffle.toString());
  }, [shuffle]);

  useEffect(() => {
    localStorage.setItem('sb_repeat', repeat);
  }, [repeat]);

  useEffect(() => {
    localStorage.setItem('sb_liked', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('sb_recent', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    localStorage.setItem('sb_albums', JSON.stringify(savedAlbums));
  }, [savedAlbums]);

  useEffect(() => {
    localStorage.setItem('sb_artists', JSON.stringify(savedArtists));
  }, [savedArtists]);

  useEffect(() => {
    localStorage.setItem('sb_playlists', JSON.stringify(savedPlaylists));
  }, [savedPlaylists]);

  useEffect(() => {
    localStorage.setItem('sb_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('sb_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const playSong = useCallback((song, songQueue = null) => {
    if (!song || !audioRef.current) return;
    setCurrentSong(song);
    setShowPlayer(true);
    audioRef.current.src = song.audio;
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
    setProgress(0);

    if (songQueue) {
      setQueue(songQueue);
      setQueueIndex(songQueue.findIndex(s => s.id === song.id));
    }

    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 30);
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying, currentSong]);

  const handleSongEnd = useCallback(() => {
    if (repeat === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else {
      playNext();
    }
  }, [repeat, queue, queueIndex, shuffle]);

  const playNext = useCallback(() => {
    if (queue.length === 0) {
      const idx = songs.findIndex(s => s.id === currentSong?.id);
      const next = songs[(idx + 1) % songs.length];
      playSong(next, songs);
      return;
    }
    let nextIdx;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = (queueIndex + 1) % queue.length;
    }
    setQueueIndex(nextIdx);
    playSong(queue[nextIdx], queue);
  }, [queue, queueIndex, shuffle, currentSong, playSong]);

  const playPrev = useCallback(() => {
    if (progress > 3) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }
    if (queue.length === 0) {
      const idx = songs.findIndex(s => s.id === currentSong?.id);
      const prev = songs[(idx - 1 + songs.length) % songs.length];
      playSong(prev, songs);
      return;
    }
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    playSong(queue[prevIdx], queue);
  }, [queue, queueIndex, progress, currentSong, playSong]);

  const seekTo = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const toggleLike = useCallback((song) => {
    setLikedSongs(prev =>
      prev.find(s => s.id === song.id)
        ? prev.filter(s => s.id !== song.id)
        : [song, ...prev]
    );
  }, []);

  const isLiked = useCallback((songId) => likedSongs.some(s => s.id === songId), [likedSongs]);

  const toggleSaveAlbum = useCallback((album) => {
    setSavedAlbums(prev =>
      prev.find(a => a.id === album.id)
        ? prev.filter(a => a.id !== album.id)
        : [album, ...prev]
    );
  }, []);

  const toggleSaveArtist = useCallback((artist) => {
    setSavedArtists(prev =>
      prev.find(a => a.id === artist.id)
        ? prev.filter(a => a.id !== artist.id)
        : [artist, ...prev]
    );
  }, []);

  const toggleSavePlaylist = useCallback((playlist) => {
    setSavedPlaylists(prev =>
      prev.find(p => p.id === playlist.id)
        ? prev.filter(p => p.id !== playlist.id)
        : [playlist, ...prev]
    );
  }, []);

  const addSearchHistory = useCallback((query) => {
    if (!query.trim()) return;
    setSearchHistory(prev => [query, ...prev.filter(q => q !== query)].slice(0, 10));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none');
  }, []);

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, progress, duration, volume, isMuted, shuffle, repeat,
      queue, queueIndex, likedSongs, recentlyPlayed, savedAlbums, savedArtists, savedPlaylists,
      searchHistory, showPlayer, theme, showLyrics, showQueue,
      playSong, togglePlay, playNext, playPrev, seekTo, setVolume, setIsMuted,
      setShuffle, toggleRepeat, toggleLike, isLiked, toggleSaveAlbum, toggleSaveArtist,
      toggleSavePlaylist, addSearchHistory, toggleTheme, setShowPlayer, setShowLyrics, setShowQueue,
      audioRef,
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
};
