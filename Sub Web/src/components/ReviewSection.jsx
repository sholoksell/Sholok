import React, { useState, useEffect, useRef } from 'react';
import { Star, Send, ThumbsUp, User, ImagePlus, X } from 'lucide-react';
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
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (productId) loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    const data = await reviewService.getProductReviews(productId);
    setReviewData(data);
    setLoading(false);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - imageFiles.length);
    if (!files.length) return;
    setImageFiles(prev => [...prev, ...files].slice(0, 3));
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...previews].slice(0, 3));
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer) {
      toast.error('Please login to submit a review');
      return;
    }
    setSubmitting(true);
    try {
      let uploadedUrls = [];
      for (const file of imageFiles) {
        try {
          const url = await reviewService.uploadImage(file);
          uploadedUrls.push(url);
        } catch { /* skip failed uploads */ }
      }
      await reviewService.submitReview({ productId, ...form, images: uploadedUrls });
      toast.success('Review submitted! It will appear after approval.');
      setShowForm(false);
      setForm({ rating: 5, title: '', comment: '' });
      setImageFiles([]);
      setImagePreviews([]);
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
            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium mb-1 block">Photos (optional, max 3)</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)}
                      className="absolute top-0 right-0 bg-black/60 text-white rounded-bl p-0.5 hover:bg-black/80">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {imageFiles.length < 3 && (
                  <>
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors">
                      <ImagePlus size={18} />
                      <span className="text-xs mt-0.5">Add</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="gap-2 bg-[#E31E24] hover:bg-[#b9151a]">
                <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setImageFiles([]); setImagePreviews([]); }}>Cancel</Button>
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
              {review.images?.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {review.images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer">
                      <img src={img} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200 hover:opacity-90 transition-opacity" onError={e => { e.target.style.display='none'; }} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
