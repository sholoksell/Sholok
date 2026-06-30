import { Star, ThumbsUp } from 'lucide-react';

function ReviewCard({ review }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-gold-500 font-semibold text-white">
            {review.reviewerName[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-950 dark:text-white">{review.reviewerName}</p>
            <p className="text-xs text-gray-400">{review.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={14} className={i < review.rating ? 'fill-gold-500 text-gold-500' : 'text-gray-300'} />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{review.comment}</p>
      <button type="button" className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600">
        <ThumbsUp size={13} />
        সহায়ক ({review.helpfulCount})
      </button>
    </div>
  );
}

export default ReviewCard;
