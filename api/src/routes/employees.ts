// BookFlow API - Employees Routes
import { Router, Request, Response } from 'express';
import { supabase, isDemoMode } from '../config/database.js';
import { EmployeeResponse } from '../types/api.js';

const router: Router = Router();

// Demo data for testing
const DEMO_EMPLOYEES: EmployeeResponse[] = [
    {
        id: '1',
        name: 'Ján Kaderník',
        avatar: undefined,
        color: '#3B82F6',
        services: ['1', '2']
    },
    {
        id: '2',
        name: 'Mária Stylistka',
        avatar: undefined,
        color: '#EC4899',
        services: ['1', '2', '3']
    },
    {
        id: '3',
        name: 'Peter Holič',
        avatar: undefined,
        color: '#10B981',
        services: ['1']
    }
];

/**
 * GET /api/v1/employees
 * Returns all active employees
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        if (isDemoMode) {
            const { serviceId } = req.query;
            let employees = DEMO_EMPLOYEES;

            if (serviceId && typeof serviceId === 'string') {
                employees = employees.filter(e => e.services.includes(serviceId));
            }

            res.json({ success: true, data: employees });
            return;
        }

        const { serviceId, locationId } = req.query;

        const query = supabase
            .from('employees')
            .select('id, name, avatar_url, color, services, location_id')
            .eq('is_active', true)
            .order('name');

        if (locationId && typeof locationId === 'string') {
            query.eq('location_id', locationId);
        }

        const { data, error } = await query;

        if (error) throw error;

        let employees: EmployeeResponse[] = (data || []).map(emp => ({
            id: emp.id,
            name: emp.name,
            avatar: emp.avatar_url,
            color: emp.color,
            services: emp.services || [],
            locationId: emp.location_id
        }));

        // Filter by service if specified
        if (serviceId && typeof serviceId === 'string') {
            employees = employees.filter(e => e.services.includes(serviceId));
        }

        res.json({ success: true, data: employees });

    } catch (err) {
        console.error('Employees fetch error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch employees'
        });
    }
});

/**
 * GET /api/v1/employees/:id
 * Returns a single employee by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (isDemoMode) {
            const employee = DEMO_EMPLOYEES.find(e => e.id === id);
            if (employee) {
                res.json({ success: true, data: employee });
            } else {
                res.status(404).json({ success: false, error: 'Employee not found' });
            }
            return;
        }

        const { data, error } = await supabase
            .from('employees')
            .select('id, name, avatar_url, color, services, working_hours, location_id')
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
            return;
        }

        res.json({
            success: true,
            data: {
                id: data.id,
                name: data.name,
                avatar: data.avatar_url,
                color: data.color,
                services: data.services || [],
                workingHours: data.working_hours,
                locationId: data.location_id
            }
        });

    } catch (err) {
        console.error('Employee fetch error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch employee'
        });
    }
});

/**
 * POST /api/v1/employees
 * Create or update an employee
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, name, avatarUrl, color, services, locationId } = req.body;

        if (!name) {
            res.status(400).json({ success: false, error: 'Employee name is required' });
            return;
        }

        const employeeData = {
            name,
            avatar_url: avatarUrl,
            color: color || '#3B82F6',
            services: services || [],
            location_id: locationId,
            is_active: true,
            updated_at: new Date()
        };

        let result;
        if (id) {
            const { data, error } = await supabase
                .from('employees')
                .update(employeeData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase
                .from('employees')
                .insert([employeeData])
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        res.json({ success: true, data: result });

    } catch (err) {
        console.error('Employee save error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to save employee'
        });
    }
});

/**
 * DELETE /api/v1/employees/:id
 * Soft delete an employee
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('employees')
            .update({ is_active: false, updated_at: new Date() })
            .eq('id', id);

        if (error) throw error;
        res.status(204).send();

    } catch (err) {
        console.error('Employee delete error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to delete employee'
        });
    }
});

export default router;
