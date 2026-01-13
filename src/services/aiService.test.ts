import { describe, it, expect } from 'vitest';
import { processAIResponse } from './aiService';

describe('aiService', () => {
    it('should detect greeting intent', async () => {
        const response = await processAIResponse('Ahoj');
        expect(response.content).toContain('Ahoj');
    });

    it('should detect booking intent and provide action', async () => {
        const response = await processAIResponse('Chcem si rezervovať termín');
        expect(response.content.toLowerCase()).toContain('rezerv');
        expect(response.actions).toBeDefined();
        expect(response.actions?.[0].type).toBe('book');
    });

    it('should detect pricing intent', async () => {
        const response = await processAIResponse('Koľko stojí strih?');
        expect(response.content.toLowerCase()).toContain('cen');
    });

    it('should detect reschedule intent', async () => {
        const response = await processAIResponse('Chcem zmeniť svoj termín');
        expect(response.content.toLowerCase()).toContain('zmeni');
        expect(response.actions).toBeDefined();
        expect(response.actions?.[0].type).toBe('reschedule');
    });

    it('should detect info intent', async () => {
        const response = await processAIResponse('Kedy mám rezerváciu?');
        expect(response.content.toLowerCase()).toContain('termín');
        expect(response.actions).toBeDefined();
        expect(response.actions?.[0].type).toBe('info');
    });

    it('should return unknown for unrecognized intent', async () => {
        const response = await processAIResponse('asdfghjkl xyz');
        expect(response.content.toLowerCase()).toContain('prepáčte');
    });

    it('should simulate delay', async () => {
        const start = Date.now();
        await processAIResponse('test');
        const duration = Date.now() - start;
        expect(duration).toBeGreaterThan(900); // At least 1s with random variance
    });
});
