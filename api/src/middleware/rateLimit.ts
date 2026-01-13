// BookFlow API - Rate Limiting
import rateLimit from 'express-rate-limit';
import { AuthenticatedRequest } from './auth.js';

/**
 * Rate limiter - 100 requests per minute per API key
 */
export const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: AuthenticatedRequest) => {
        // Rate limit per API key, fallback to IP
        return req.apiKeyId || req.ip || 'unknown';
    },
    skip: (req) => {
        // Skip rate limiting for health check
        return req.path === '/health';
    }
});

/**
 * Stricter rate limiter for booking creation
 */
export const bookingRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 bookings per minute
    message: {
        error: 'Too Many Requests',
        message: 'Booking rate limit exceeded. Please try again later.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: AuthenticatedRequest) => {
        return `booking:${req.apiKeyId || req.ip || 'unknown'}`;
    }
});
