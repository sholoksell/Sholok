import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Radio } from 'lucide-react';

type Session = {
  id: number;
  title: string;
  status: 'scheduled' | 'live' | 'ended';
  vendor_id: number;
  store_name: string;
  scheduled_at: string;
  viewer_count: number;
  product_count: number;
};

const statusColors: Record<string, string> = {
  live: 'bg-red-100 text-red-700',
  scheduled: 'bg-blue-100 text-blue-700',
  ended: 'bg-gray-100 text-gray-600',
};

export default function LiveSessions() {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch('/admin-api/live-shop/sessions?status=all&limit=50')
      .then(r => r.json())
      .then(d => setSessions(d.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">{t('liveShoppingSessions')}</h1>
      </div>

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Video size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">{t('noLiveSessionsYet')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('vendorsCanCreateSessions')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Session</th>
                    <th className="pb-2 font-medium">{t('store')}</th>
                    <th className="pb-2 font-medium">{t('status')}</th>
                    <th className="pb-2 font-medium">{t('scheduled')}</th>
                    <th className="pb-2 font-medium">{t('viewers')}</th>
                    <th className="pb-2 font-medium">{t('products')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {s.status === 'live' ? <Radio size={14} className="text-red-500 animate-pulse" /> : <Video size={14} className="text-gray-400" />}
                          <span className="font-medium">{s.title}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">{s.store_name}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status]}`}>
                          {s.status === 'live' ? t('liveStatus') : s.status === 'scheduled' ? t('scheduledStatus') : t('endedStatus')}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">
                        {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : '—'}
                      </td>
                      <td className="py-3">{s.viewer_count || 0}</td>
                      <td className="py-3">{s.product_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
