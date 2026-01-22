import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { supabase, isDemoMode, DEMO_FAVORITES } from '../lib/supabase';
import type { Favorite } from '../types';

export function useFavorites(customerId?: string): UseQueryResult<Favorite[], Error> {
  return useQuery({
    queryKey: ['favorites', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      if (isDemoMode) {
        return DEMO_FAVORITES.filter(f => f.customerId === customerId || !customerId);
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('customer_id', customerId);

      if (error) throw error;

      return data.map(f => ({
        id: f.id,
        customerId: f.customer_id,
        employeeId: f.employee_id
      })) as Favorite[];
    }
  });
}

export function useToggleFavorite(): UseMutationResult<void, Error, { customerId: string, employeeId: string, isFavorite: boolean }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, employeeId, isFavorite }: { customerId: string, employeeId: string, isFavorite: boolean }) => {
      if (isDemoMode) {
        if (isFavorite) {
          // Remove
          const idx = DEMO_FAVORITES.findIndex(f => f.customerId === customerId && f.employeeId === employeeId);
          if (idx !== -1) DEMO_FAVORITES.splice(idx, 1);
        } else {
          // Add
          DEMO_FAVORITES.push({ id: `f${Math.random()}`, customerId, employeeId });
        }
        return;
      }

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('customer_id', customerId)
          .eq('employee_id', employeeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ customer_id: customerId, employee_id: employeeId }]);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', variables.customerId] });
    }
  });
}
