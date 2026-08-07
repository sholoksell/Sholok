import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type VendorReview = {
  id: number;
  vendor_id: number;
  store_name: string;
  customer_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
};

export default function VendorReviews() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const statusLabel: Record<string, string> = {
    all: t('allStatus'),
    pending: t('pending'),
    approved: t('approved'),
    rejected: t('rejected'),
  };

  const load = () => {
    setLoading(true);
    fetch(`/admin-api/vendor-reviews?status=${filter}`)
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/admin-api/vendor-reviews/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">{t('vendorReviews')}</h1>
        <div className="flex gap-2">
          {['all','pending','approved','rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-lg text-sm capitalize ${filter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {statusLabel[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_,i) => <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">{t('noVendorReviewsFound')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{r.store_name}</span>
                        <span className="text-gray-400 text-xs">{t('reviewedBy')} {r.customer_name}</span>
                        <div className="flex">
                          {Array(5).fill(0).map((_,i) => (
                            <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{r.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {r.status !== 'approved' && (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateStatus(r.id, 'approved')}>{t('approve')}</Button>
                      )}
                      {r.status !== 'rejected' && (
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus(r.id, 'rejected')}>{t('reject')}</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
