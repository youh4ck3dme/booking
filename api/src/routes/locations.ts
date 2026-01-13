// BookFlow API - Locations Route
import express, { Router } from 'express';
import { supabase } from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router: Router = express.Router();

/**
 * GET /api/v1/locations
 * List all locations for the authenticated user/API key
 */
router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('api_key_id', req.apiKeyId)
            .order('name');

        if (error) throw error;
        res.json(data);
    } catch (error: unknown) {
        console.error('Error fetching locations:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Failed to fetch locations', details: message });
    }
});

/**
 * POST /api/v1/locations
 * Create or update a location
 */
router.post('/', async (req: AuthenticatedRequest, res) => {
    try {
        const { id, name, address, phone, email, business_hours, coordinates } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Location name is required' });
        }

        const locationData = {
            name,
            address,
            phone,
            email,
            business_hours,
            coordinates,
            api_key_id: req.apiKeyId,
            updated_at: new Date()
        };

        let result;
        if (id) {
            // Update existing
            const { data, error } = await supabase
                .from('locations')
                .update(locationData)
                .eq('id', id)
                .eq('api_key_id', req.apiKeyId)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Create new
            const { data, error } = await supabase
                .from('locations')
                .insert([locationData])
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        res.json(result);
    } catch (error: unknown) {
        console.error('Error saving location:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Failed to save location', details: message });
    }
});

/**
 * DELETE /api/v1/locations/:id
 * Delete a location
 */
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('locations')
            .delete()
            .eq('id', id)
            .eq('api_key_id', req.apiKeyId);

        if (error) throw error;
        res.status(204).send();
    } catch (error: unknown) {
        console.error('Error deleting location:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Failed to delete location', details: message });
    }
});

export default router;
