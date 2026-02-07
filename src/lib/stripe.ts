import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!publicKey) {
      console.warn('Stripe public key is missing. Payments will not work.');
    }
    stripePromise = loadStripe(publicKey || '');
  }
  return stripePromise;
};
