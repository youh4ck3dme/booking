import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, url, ip } = req;

    // Log the incoming request
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${ip}`);

    // Capture the finish event to log duration
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;

        let color = '\x1b[32m'; // Green
        if (statusCode >= 400) color = '\x1b[33m'; // Yellow
        if (statusCode >= 500) color = '\x1b[31m'; // Red

        console.log(`[${new Date().toISOString()}] ${method} ${url} ${color}${statusCode}\x1b[0m - ${duration}ms`);
    });

    next();
};
