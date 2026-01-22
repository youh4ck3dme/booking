import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { supabase, isDemoMode, DEMO_REVIEWS } from '../lib/supabase';
import type { Review } from '../types';

export function useReviews(entityId?: string, type: 'employee' | 'service' | 'customer' = 'employee'): UseQueryResult<Review[], Error> {
  return useQuery({
    queryKey: ['reviews', entityId, type],
    queryFn: async () => {
      if (isDemoMode) {
        if (!entityId) return DEMO_REVIEWS;
        if (type === 'employee') return DEMO_REVIEWS.filter(r => r.employeeId === entityId);
        if (type === 'service') return DEMO_REVIEWS.filter(r => r.serviceId === entityId);
        if (type === 'customer') return DEMO_REVIEWS.filter(r => r.customerId === entityId);
        return DEMO_REVIEWS;
      }

      let query = supabase.from('reviews').select('*');
      
      if (entityId) {
        if (type === 'employee') query = query.eq('employee_id', entityId);
        else if (type === 'service') query = query.eq('service_id', entityId);
        else if (type === 'customer') query = query.eq('customer_id', entityId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      return data.map(r => ({
        id: r.id,
        bookingId: r.booking_id,
        customerId: r.customer_id,
        customerName: r.customer_name,
        employeeId: r.employee_id,
        serviceId: r.service_id,
        rating: r.rating,
        comment: r.comment,
        createdAt: new Date(r.created_at)
      })) as Review[];
    }
  });
}

export function useAddReview(): UseMutationResult<unknown, Error, Omit<Review, 'id' | 'createdAt'>> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (review: Omit<Review, 'id' | 'createdAt'>) => {
      if (isDemoMode) {
        const newReview = { ...review, id: `r${Math.random()}`, createdAt: new Date() };
        DEMO_REVIEWS.unshift(newReview);
        return newReview;
      }

      const { data, error } = await supabase.from('reviews').insert([{
        booking_id: review.bookingId,
        customer_id: review.customerId,
        customer_name: review.customerName,
        employee_id: review.employeeId,
        service_id: review.serviceId,
        rating: review.rating,
        comment: review.comment
      }]).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] }); // Re-fetch to show reviewed status
    }
  });
}
