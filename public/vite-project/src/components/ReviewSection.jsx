import React, { useState, useEffect } from 'react';
import { Star, Send, ThumbsUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reviewService } from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ReviewSection = ({ productId }) => {
  const { customer } = useAuth();
  const [reviewData, setReviewData] = useState({ reviews: [], stats: null });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => {
    if (productId) loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    const data = await reviewService.getProductReviews(productId);
    setReviewData(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer) {
      toast.error('Please login to submit a review');
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.submitReview({ productId, ...form });
      toast.success('Review submitted! It will appear after approval.');
      setShowForm(false);
      setForm({ rating: 5, title: '', comment: '' });
      loadReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const { stats } = reviewData;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {stats && stats.total > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/30 rounded-xl">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{stats.averageRating}</p>
            <div className="flex justify-center gap-0.5 my-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(stats.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{stats.total} reviews</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5,4,3,2,1].map(star => {
              const count = stats.distribution[star - 1] || 0;
              const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{star}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-8 text-muted-foreground text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write Review Button / Form */}
      <div>
        {!showForm ? (
          <Button onClick={() => customer ? setShowForm(true) : toast.error('Please login to write a review')} variant="outline" className="gap-2">
            <Star className="w-4 h-4" /> Write a Review
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="border rounded-xl p-4 space-y-4 bg-background">
            <h4 className="font-semibold">Write Your Review</h4>
            {/* Star Rating */}
            <div>
              <label className="text-sm font-medium mb-1 block">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm({ ...form, rating: i })}
                    className="p-1"
                  >
                    <Star className={`w-6 h-6 transition-colors ${i <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-1 block">Title (optional)</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Summary of your review"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            {/* Comment */}
            <div>
              <label className="text-sm font-medium mb-1 block">Your Review</label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Share your experience with this product..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="gap-2 bg-[#E31E24] hover:bg-[#b9151a]">
                <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-6 text-muted-foreground">Loading reviews...</div>
      ) : reviewData.reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Star className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewData.reviews.map((review) => (
            <div key={review._id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{review.customerId?.name || 'Customer'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              {review.title && <p className="font-medium text-sm">{review.title}</p>}
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
