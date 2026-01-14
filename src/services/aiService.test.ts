import { describe, it, expect } from 'vitest';
import { processAIResponse } from './aiService';

describe('aiService', () => {
    it('should detect greeting intent', async () => {
        const response = await processAIResponse('Ahoj');
        expect(['Ahoj!', 'Dobrý deň!', 'Zdravím vás!'].some(r => response.content.includes(r))).toBe(true);
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
        expect(response.content.toLowerCase()).toContain('zmeniť');
        expect(response.actions).toBeDefined();
        expect(response.actions?.[0].type).toBe('reschedule');
    });

    it('should detect info intent', async () => {
        const response = await processAIResponse('Kedy mám rezerváciu?');
        // Info response contains 'najbližší termín' or 'profile'
        expect(response.content.toLowerCase()).toMatch(/termín|profil/);
        expect(response.actions).toBeDefined();
        expect(response.actions?.[0].type).toBe('info');
    });

    it('should return unknown for unrecognized intent', async () => {
        const response = await processAIResponse('asdfghjkl xyz');
        // Unknown can be 'Prepáčte' or 'Nie som si istý'
        expect(response.content.toLowerCase()).toMatch(/prepáčte|nie som si istý/);
    });

    it('should simulate delay', async () => {
        const start = Date.now();
        await processAIResponse('test');
        const duration = Date.now() - start;
        expect(duration).toBeGreaterThan(900); // At least ~1s with random variance
    });
});
