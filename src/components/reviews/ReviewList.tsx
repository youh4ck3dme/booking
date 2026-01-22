import React from 'react';
import { Star, User } from 'lucide-react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import type { Review } from '../../types';

interface ReviewListProps {
  reviews: Review[];
  isLoading?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews, isLoading }) => {
  if (isLoading) {
    return <div className="animate-pulse space-y-md">
      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface/50 rounded-lg"></div>)}
    </div>;
  }

  if (reviews.length === 0) {
    return <div className="text-center py-lg text-secondary">Zatiaľ žiadne hodnotenia.</div>;
  }

  return (
    <div className="space-y-md">
      {reviews.map((review) => (
        <div key={review.id} className="glass-card p-md">
          <div className="flex justify-between items-start mb-sm">
            <div className="flex items-center gap-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User size={16} />
              </div>
              <div>
                <div className="font-semibold text-sm">{review.customerName}</div>
                <div className="text-xs text-secondary">
                  {format(review.createdAt, 'd. MMMM yyyy', { locale: sk })}
                </div>
              </div>
            </div>
            <div className="flex gap-xs">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-secondary/90 italic">"{review.comment}"</p>
        </div>
      ))}
    </div>
  );
};
