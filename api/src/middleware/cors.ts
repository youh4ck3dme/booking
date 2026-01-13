import cors from 'cors';
import { AuthenticatedRequest } from './auth.js';

const defaultOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];

/**
 * Dynamic CORS configuration
 * Allows origins based on API key configuration or default list
 */
export const corsMiddleware = cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
            callback(null, true);
            return;
        }

        // Check against default origins
        if (defaultOrigins.includes(origin) || defaultOrigins.includes('*')) {
            callback(null, true);
            return;
        }

        // WordPress sites will have their origins validated per-request
        // after API key authentication
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-BookFlow-API-Key', 'Authorization'],
    maxAge: 86400 // 24 hours
});

/**
 * Post-auth CORS validation (checks API key allowed origins)
 */
export function validateOrigin(req: AuthenticatedRequest): boolean {
    const origin = req.headers.origin;
    const allowedOrigins = req.allowedOrigins || [];

    if (!origin) return true;
    if (allowedOrigins.includes('*')) return true;
    if (allowedOrigins.includes(origin)) return true;

    return false;
}
