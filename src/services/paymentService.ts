import { isDemoMode } from '../lib/supabase';
import type { PaymentStatus } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const PaymentService = {
  async initiatePayment(bookingId: string, amount: number, email: string): Promise<{ checkoutId: string, redirectUrl?: string }> {
    if (isDemoMode) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // We need to update the booking status in the mock data to see the change in UI
      // Since DEMO_BOOKINGS is in useBookings.ts and not exported/accessible easily here,
      // we are limited. However, in a real app, the backend would handle this.
      // For this demo, let's assume the mutation in the component might need to re-fetch
      // or we can hackily access it if we moved DEMO_BOOKINGS to a shared store.
      
      // Better approach for Frontend-Only Demo: 
      // We will pretend we redirect to success and the user manually refreshes or we optimistically update.
      // But wait! We can use a custom event or just trust the user will see 'paid' if we could write to the array.
      
      return { 
        checkoutId: `mock_chk_${Math.random().toString(36).substr(2, 9)}`,
        // In a real flow, this would be the SumUp hosted checkout page
        // For demo, we might redirect to a local success page or handle it inline
        redirectUrl: undefined // Undefined means "success" inline for our mock handlePay
      };
    }

    const response = await fetch(`${API_URL}/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-BookFlow-API-Key': ... // if we implement that on frontend or proxy
      },
      body: JSON.stringify({ bookingId, amount, email })
    });

    if (!response.ok) {
      throw new Error('Payment initiation failed');
    }

    return response.json();
  },

  async checkStatus(checkoutId: string): Promise<PaymentStatus> {
    if (isDemoMode) {
        return 'paid';
    }
    
    const response = await fetch(`${API_URL}/payments/status/${checkoutId}`);
    if (!response.ok) throw new Error('Failed to check status');
    const data = await response.json();
    return data.status;
  }
};
