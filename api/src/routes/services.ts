// BookFlow API - Services Routes
import { Router, Request, Response } from 'express';
import { supabase, isDemoMode } from '../config/database.js';
import { ApiResponse, ServiceResponse } from '../types/api.js';

const router: Router = Router();

// Demo data for testing without database
const DEMO_SERVICES: ServiceResponse[] = [
    {
        id: '1',
        name: 'Strihanie vlasov',
        description: 'Profesionálne strihanie vlasov podľa vašich predstáv',
        duration: 45,
        price: 25,
        category: 'hair',
        color: '#3B82F6',
        icon: 'scissors'
    },
    {
        id: '2',
        name: 'Farbenie vlasov',
        description: 'Kvalitné farbenie s profesionálnymi farbami',
        duration: 90,
        price: 55,
        category: 'hair',
        color: '#8B5CF6',
        icon: 'palette'
    },
    {
        id: '3',
        name: 'Manikúra',
        description: 'Kompletná starostlivosť o vaše nechty',
        duration: 60,
        price: 30,
        category: 'nails',
        color: '#EC4899',
        icon: 'sparkles'
    }
];

/**
 * GET /api/v1/services
 * Returns all active services
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        if (isDemoMode) {
            const response: ApiResponse<ServiceResponse[]> = {
                success: true,
                data: DEMO_SERVICES
            };
            res.json(response);
            return;
        }

        const { category, locationId } = req.query;

        const query = supabase
            .from('services')
            .select('id, name, description, duration, price, category, color, icon, location_id')
            .eq('is_active', true)
            .order('name');

        if (category && typeof category === 'string') {
            query.eq('category', category);
        }

        if (locationId && typeof locationId === 'string') {
            query.eq('location_id', locationId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const response: ApiResponse<ServiceResponse[]> = {
            success: true,
            data: data || []
        };
        res.json(response);

    } catch (err) {
        console.error('Services fetch error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch services'
        });
    }
});

/**
 * GET /api/v1/services/:id
 * Returns a single service by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (isDemoMode) {
            const service = DEMO_SERVICES.find(s => s.id === id);
            if (service) {
                res.json({ success: true, data: service });
            } else {
                res.status(404).json({ success: false, error: 'Service not found' });
            }
            return;
        }

        const { data, error } = await supabase
            .from('services')
            .select('id, name, description, duration, price, category, color, icon')
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            res.status(404).json({
                success: false,
                error: 'Service not found'
            });
            return;
        }

        res.json({ success: true, data });

    } catch (err) {
        console.error('Service fetch error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch service'
        });
    }
});

/**
 * POST /api/v1/services
 * Create or update a service
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, name, description, duration, price, category, color, icon, locationId } = req.body;

        if (!name) {
            res.status(400).json({ success: false, error: 'Service name is required' });
            return;
        }

        const serviceData = {
            name,
            description,
            duration,
            price,
            category,
            color: color || '#3B82F6',
            icon: icon || 'scissors',
            location_id: locationId,
            is_active: true,
            updated_at: new Date()
        };

        let result;
        if (id) {
            const { data, error } = await supabase
                .from('services')
                .update(serviceData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase
                .from('services')
                .insert([serviceData])
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        res.json({ success: true, data: result });

    } catch (err) {
        console.error('Service save error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to save service'
        });
    }
});

/**
 * DELETE /api/v1/services/:id
 * Soft delete a service (set is_active to false)
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('services')
            .update({ is_active: false, updated_at: new Date() })
            .eq('id', id);

        if (error) throw error;
        res.status(204).send();

    } catch (err) {
        console.error('Service delete error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to delete service'
        });
    }
});

export default router;
