import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare } from 'lucide-react';

type Review = {
  id: number; customer_id: number; customer_name: string;
  rating: number; comment: string; status: string; order_id: number; created_at: string;
};

export default function VendorReviews() {
  const { vendor, token } = useVendorAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!vendor?._id) return;
    setLoading(true);
    fetch(`/admin-api/stores/${vendor.slug}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json())
      .then(d => {
        let revs = d.reviews || [];
        if (filter !== 'all') revs = revs.filter((r: Review) => r.status === filter);
        setReviews(revs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vendor?._id, filter]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Store Reviews</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-5">
            <p className="text-sm text-emerald-700">Average Rating</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={20} className="text-yellow-400 fill-yellow-400" />
              <span className="text-2xl font-bold text-emerald-800">{avgRating}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500">Total Reviews</p>
            <p className="text-2xl font-bold">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500">5-Star Reviews</p>
            <p className="text-2xl font-bold">{reviews.filter(r => r.rating === 5).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Reviews</CardTitle>
            <div className="flex gap-2">
              {['all','approved','pending'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-2 py-1 rounded text-xs capitalize ${filter === s ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_,i) => <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{r.customer_name || `Customer #${r.customer_id}`}</span>
                        <div className="flex">
                          {Array(5).fill(0).map((_,i) => (
                            <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${r.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{r.comment}</p>
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
