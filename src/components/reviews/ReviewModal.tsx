import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAddReview } from '../../hooks/useReviews';
import { useToast } from '../../hooks/useToast';
import type { Booking } from '../../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, booking }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const addReview = useAddReview();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addReview.mutateAsync({
        bookingId: booking.id,
        customerId: booking.customerId,
        customerName: booking.customerName,
        employeeId: booking.employeeId,
        serviceId: booking.serviceId,
        rating,
        comment
      });
      toast.success('Hotovo', 'Ďakujeme za vaše hodnotenie!');
      onClose();
    } catch {
      toast.error('Chyba', 'Nepodarilo sa odoslať hodnotenie.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card w-full max-w-md p-lg relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-md right-md text-secondary hover:text-primary transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-md">Hodnotenie návštevy</h2>
            <p className="text-sm text-secondary mb-lg">
              Ako ste boli spokojní so službou <strong>{booking.serviceName}</strong>?
            </p>

            <form onSubmit={handleSubmit} className="space-y-lg">
              <div className="flex justify-center gap-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={`transition-transform hover:scale-110 focus:outline-none ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <Star size={32} className={star <= rating ? 'fill-current' : ''} />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-xs">Komentár (voliteľné)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input w-full min-h-[100px]"
                  placeholder="Napíšte nám vašu skúsenosť..."
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={addReview.isPending}
              >
                {addReview.isPending ? 'Odosielam...' : 'Odoslať hodnotenie'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
