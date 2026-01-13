// BookFlow API - Main Entry Point
import express from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './middleware/cors.js';
import { rateLimiter } from './middleware/rateLimit.js';
import { authenticateApiKey } from './middleware/auth.js';
import { loggerMiddleware } from './middleware/logger.js';

// Routes
import servicesRouter from './routes/services.js';
import employeesRouter from './routes/employees.js';
import bookingsRouter from './routes/bookings.js';
import locationsRouter from './routes/locations.js';
import settingsRouter from './routes/settings.js';

const app: express.Application = express();
const PORT = process.env.PORT || 3001;

// ===========================================
// Global Middleware
// ===========================================

// Request logging
app.use(loggerMiddleware);

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(corsMiddleware);

// JSON body parsing
app.use(express.json({ limit: '1mb' }));

// Rate limiting
app.use(rateLimiter);

// ===========================================
// Health Check (No Auth Required)
// ===========================================

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Info
app.get('/api/v1', (req, res) => {
    res.json({
        name: 'BookFlow Pro API',
        version: '1.0.0',
        documentation: 'https://docs.bookflow.pro/api'
    });
});

// ===========================================
// Protected Routes (API Key Required)
// ===========================================

app.use('/api/v1/services', authenticateApiKey, servicesRouter);
app.use('/api/v1/employees', authenticateApiKey, employeesRouter);
app.use('/api/v1/bookings', authenticateApiKey, bookingsRouter);
app.use('/api/v1/locations', authenticateApiKey, locationsRouter);
app.use('/api/v1/settings', authenticateApiKey, settingsRouter);

// Slots are under bookings but exposed at root level for convenience
app.get('/api/v1/slots', authenticateApiKey, (req, res, next) => {
    req.url = '/slots';
    bookingsRouter(req, res, next);
});

// ===========================================
// Error Handling
// ===========================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Global Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // _next is required for Express to recognize this as an error handler
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
});

// ===========================================
// Server Start
// ===========================================

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   📅 BookFlow Pro API v1.0.0                         ║
║                                                      ║
║   Server running on http://localhost:${PORT}            ║
║                                                      ║
║   Endpoints:                                         ║
║   • GET  /health          - Health check             ║
║   • GET  /api/v1          - API info                 ║
║   • GET  /api/v1/services - List services            ║
║   • GET  /api/v1/employees - List employees          ║
║   • GET  /api/v1/slots    - Get available slots      ║
║   • POST /api/v1/bookings - Create booking           ║
║   • GET  /api/v1/settings/widget - Widget config     ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
    `);
});

export default app;
