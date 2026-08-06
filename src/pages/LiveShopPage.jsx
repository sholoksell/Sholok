import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Users, Calendar, Store, Play, Clock } from 'lucide-react';
import api from '@/lib/axios';

function SessionCard({ session }) {
  const isLive = session.status === 'live';
  const isUpcoming = session.status === 'scheduled';

  const formatDate = (str) => {
    if (!str) return '';
    return new Date(str).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow ${isLive ? 'border-red-300 shadow-red-100 shadow-sm' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 aspect-video flex items-center justify-center">
        {session.thumbnail ? (
          <img src={session.thumbnail} alt={session.title} className="w-full h-full object-cover absolute inset-0" />
        ) : (
          <Video size={40} className="text-gray-600" />
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {isLive && (
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full" />
              LIVE
            </span>
          )}
          {isUpcoming && (
            <span className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              <Calendar size={10} />
              UPCOMING
            </span>
          )}
        </div>

        {/* Viewer count */}
        {isLive && session.viewer_count > 0 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Users size={10} />
            {session.viewer_count.toLocaleString()}
          </div>
        )}

        {/* Play button overlay */}
        {isLive && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
              <Play size={24} className="text-white ml-1" fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">{session.title || 'Live Shopping Session'}</h3>

        {session.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{session.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Store size={12} />
          <span className="font-medium text-gray-700">
            {session.store_name ? (
              <Link to={`/store/${session.store_slug}`} className="hover:text-primary transition-colors">
                {session.store_name}
              </Link>
            ) : 'Unknown Store'}
          </span>
        </div>

        {isUpcoming && session.scheduled_at && (
          <div className="flex items-center gap-1 text-xs text-blue-600 mt-2">
            <Clock size={12} />
            <span>Starts {formatDate(session.scheduled_at)}</span>
          </div>
        )}

        {isLive && session.stream_url && (
          <a
            href={session.stream_url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            <Play size={14} fill="white" />
            Watch Live
          </a>
        )}
      </div>
    </div>
  );
}

export default function LiveShopPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/live-shop/sessions')
      .then(r => setSessions(r.data?.sessions || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const liveSessions = sessions.filter(s => s.status === 'live');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Video size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Live Shopping</h1>
            <p className="text-red-100 text-sm">Shop live with vendors in real time</p>
          </div>
        </div>
        {liveSessions.length > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {liveSessions.length} session{liveSessions.length !== 1 ? 's' : ''} live now
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16">
          <Video size={56} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Live Sessions Right Now</h2>
          <p className="text-gray-400 text-sm">Check back later or browse our products below.</p>
          <Link to="/" className="inline-block mt-6 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          {/* Live Now */}
          {liveSessions.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
                Live Now
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveSessions.map(s => <SessionCard key={s.id} session={s} />)}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcomingSessions.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Coming Up
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingSessions.map(s => <SessionCard key={s.id} session={s} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
