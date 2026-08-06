import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Search, BarChart3 } from 'lucide-react';

export default function SearchAnalytics() {
  const { t } = useLanguage();
  const [popular, setPopular] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/admin-api/search/popular?limit=20')
      .then(r => r.json())
      .then(d => {
        setPopular(d.popular || []);
        setTrending(d.trending || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">{t('searchAnalytics')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" /> {t('popularSearches')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{Array(5).fill(0).map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : popular.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">{t('noSearchDataYet')}</p>
            ) : (
              <div className="space-y-2">
                {popular.map((query, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5">#{i+1}</span>
                      <Search size={14} className="text-gray-400" />
                      <span className="text-sm font-medium">{query}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{i === 0 ? '🔥 Top' : ''}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-orange-500" /> {t('trendingNow')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{Array(5).fill(0).map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : trending.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">{t('noTrendingSearches')}</p>
            ) : (
              <div className="space-y-2">
                {trending.map((query, i) => (
                  <div key={i} className="flex items-center gap-2 py-2 border-b last:border-0">
                    <TrendingUp size={14} className="text-orange-400" />
                    <span className="text-sm font-medium">{query}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
