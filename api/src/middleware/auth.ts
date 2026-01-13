// BookFlow API - API Key Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { supabase, isDemoMode } from '../config/database.js';

export interface AuthenticatedRequest extends Request {
    apiKeyId?: string;
    apiKeyName?: string;
    allowedOrigins?: string[];
}

// Demo API key for testing (only works in demo mode)
const DEMO_API_KEY = 'bf_demo_key_12345';

/**
 * Hash an API key for storage/comparison
 */
export function hashApiKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
}

/**
 * Extract prefix from API key (first 8 chars for identification)
 */
export function getApiKeyPrefix(key: string): string {
    return key.substring(0, 8);
}

/**
 * Middleware to validate API key from X-BookFlow-API-Key header
 */
export async function authenticateApiKey(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const apiKey = req.headers['x-bookflow-api-key'] as string;

    if (!apiKey) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing X-BookFlow-API-Key header'
        });
        return;
    }

    // Demo mode: accept demo key
    if (isDemoMode && apiKey === DEMO_API_KEY) {
        req.apiKeyId = 'demo';
        req.apiKeyName = 'Demo Key';
        req.allowedOrigins = ['*'];
        next();
        return;
    }

    try {
        const keyHash = hashApiKey(apiKey);
        const keyPrefix = getApiKeyPrefix(apiKey);

        const { data: keyRecord, error } = await supabase
            .from('api_keys')
            .select('id, name, allowed_origins, is_active')
            .eq('key_hash', keyHash)
            .eq('prefix', keyPrefix)
            .single();

        if (error || !keyRecord) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid API key'
            });
            return;
        }

        if (!keyRecord.is_active) {
            res.status(403).json({
                error: 'Forbidden',
                message: 'API key is deactivated'
            });
            return;
        }

        // Update last used timestamp (fire and forget)
        supabase
            .from('api_keys')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', keyRecord.id)
            .then();

        req.apiKeyId = keyRecord.id;
        req.apiKeyName = keyRecord.name;
        req.allowedOrigins = keyRecord.allowed_origins || [];

        next();
    } catch (err) {
        console.error('API Key validation error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to validate API key'
        });
    }
}
