import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''; // Use service key for admin access

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware for API Key
const apiKeyMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Skip auth for health check
    if (req.path === '/health') return next();

    // Check for API Key in headers
    const apiKey = req.headers['x-bookflow-api-key'];
    
    // Validate API Key - Simplified for now (could check DB if keys are stored there)
    // For now, checks against env var or simply requires presence
    if (!apiKey) {
        return res.status(401).json({ message: 'Missing API Key' });
    }
    
    // Proper implementation would query 'api_keys' table
    // For MVP/Demo: accept any non-empty key or specific env key
    next();
};

import paymentRoutes from './routes/payments';

app.use('/api/v1', apiKeyMiddleware);
app.use('/api/v1/payments', paymentRoutes);

// Routes

// 1. GET /api/v1/services
app.get('/api/v1/services', async (req, res) => {
    try {
        const { data, error } = await supabase.from('services').select('*').order('name');
        if (error) throw error;
        res.json({ data });
    } catch (err: unknown) {
        const error = err as Error;
        res.status(500).json({ message: error.message });
    }
});

// 2. GET /api/v1/employees
app.get('/api/v1/employees', async (req, res) => {
    try {
        // const { serviceId } = req.query; // TODO: Filter by service when junction table exists
        const query = supabase.from('employees').select('*').eq('is_active', true);
        
        // Note: Real implementation might filter by service_employees junction table
        // For MVP, we return all active employees
        
        const { data, error } = await query;
        if (error) throw error;
        res.json({ data });
    } catch (err: unknown) {
        const error = err as Error;
        res.status(500).json({ message: error.message });
    }
});

// 3. GET /api/v1/slots
app.get('/api/v1/slots', async (req, res) => {
    try {
        const { date, serviceId } = req.query;
        // const { employeeId } = req.query; // TODO: Filter slots by employee
        if (!date || !serviceId) {
             return res.status(400).json({ message: 'Missing date or serviceId' });
        }
        
        // Logic to calculate available slots:
        // 1. Get Employee working hours
        // 2. Get existing bookings for Date + Employee
        // 3. Subtract bookings from working hours
        // For this MVP, we will return a set of standard slots
        
        const slots = [
            { id: '1', startTime: '09:00', endTime: '09:30', isAvailable: true },
            { id: '2', startTime: '10:00', endTime: '10:30', isAvailable: true },
            { id: '3', startTime: '11:00', endTime: '11:45', isAvailable: true }, // Logic dependent on service duration
            { id: '4', startTime: '13:00', endTime: '13:30', isAvailable: true },
            { id: '5', startTime: '14:00', endTime: '14:30', isAvailable: true },
        ];
        
        res.json({ data: slots });
    } catch (err: unknown) {
        const error = err as Error;
        res.status(500).json({ message: error.message });
    }
});

// 4. POST /api/v1/bookings
app.post('/api/v1/bookings', async (req, res) => {
    try {
        const body = req.body;
        // Basic Validation
        if (!body.serviceId || !body.date || !body.startTime || !body.customerEmail) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Fetch service to get price/duration
        const { data: service } = await supabase.from('services').select('*').eq('id', body.serviceId).single();
        if (!service) throw new Error('Service not found');

        const { data, error } = await supabase.from('bookings').insert([
            {
                customer_name: body.customerName,
                customer_email: body.customerEmail,
                customer_phone: body.customerPhone,
                service_id: body.serviceId,
                employee_id: body.employeeId, // Can be null if "Any"
                date: body.date, // yyyy-MM-dd
                start_time: body.startTime, // HH:mm
                end_time: body.endTime, // HH:mm (calculated by client or here)
                duration: service.duration,
                price: service.price,
                status: 'pending',
                notes: body.notes || 'Via WordPress Plugin',
                location_id: body.locationId || 'default'
            }
        ]).select().single();
        
        if (error) throw error;
        res.json({ data });
    } catch (err: unknown) {
         const error = err as Error;
         res.status(500).json({ message: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
