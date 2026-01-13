// BookFlow API - Settings Routes
import { Router, Response } from 'express';
import { supabase, isDemoMode } from '../config/database.js';
import { WidgetConfigResponse } from '../types/api.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router: Router = Router();

// Default widget configuration
const DEFAULT_CONFIG: WidgetConfigResponse = {
    theme: 'auto',
    primaryColor: '#3B82F6',
    showEmployees: true,
    showPrices: true,
    locale: 'sk',
    customCss: undefined
};

/**
 * GET /api/v1/settings/widget
 * Returns widget configuration for this API key
 */
router.get('/widget', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (isDemoMode) {
            res.json({ success: true, data: DEFAULT_CONFIG });
            return;
        }

        const { data, error } = await supabase
            .from('widget_configs')
            .select('theme, primary_color, show_employees, show_prices, locale, custom_css')
            .eq('api_key_id', req.apiKeyId)
            .single();

        if (error || !data) {
            // Return default config if none exists
            res.json({ success: true, data: DEFAULT_CONFIG });
            return;
        }

        const config: WidgetConfigResponse = {
            theme: data.theme,
            primaryColor: data.primary_color,
            showEmployees: data.show_employees,
            showPrices: data.show_prices,
            locale: data.locale,
            customCss: data.custom_css
        };

        res.json({ success: true, data: config });

    } catch (err) {
        console.error('Settings fetch error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch settings'
        });
    }
});

export default router;
