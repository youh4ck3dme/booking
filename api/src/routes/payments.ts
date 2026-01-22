import express from 'express';
import { sumUpService } from '../services/sumup';

const router = express.Router();

// POST /api/v1/payments/initiate
router.post('/initiate', async (req, res) => {
    try {
        const { bookingId, amount, email } = req.body;
        
        if (!bookingId || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create Checkout
        const checkout = await sumUpService.createCheckout(amount, 'EUR', bookingId, email);
        
        res.json({
            checkoutId: checkout.checkout_id,
            redirectUrl: checkout.redirect_url // Or the SumUp hosted page URL
        });
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ message: 'Failed to initiate payment' });
    }
});

// GET /api/v1/payments/status/:checkoutId
router.get('/status/:checkoutId', (req, res) => {
    // In real world, check SumUp API
    res.json({ status: 'paid' });
});

export default router;
