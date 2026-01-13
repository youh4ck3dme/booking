import { test, expect } from '@playwright/test';

test.describe('Booking App E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('should allow user to login and see dashboard', async ({ page }) => {
        // Navigate to login
        await page.click('text=Prihlásiť sa');
        await expect(page).toHaveURL(/\/login/);

        // Fill credentials (assuming demo mode or test user)
        await page.fill('input[type="email"]', 'demo@bookflow.sk');
        await page.fill('input[type="password"]', 'demo123');
        await page.click('button[type="submit"]');

        // Check successful login redirect
        await expect(page).toHaveURL(/\//); // Redirects to home after login usually

        // Check if user name is visible in header
        await expect(page.locator('.app-header')).toContainText('Ján Novák'); // Demo user name
    });

    test('should navigate to booking page', async ({ page }) => {
        await page.click('text=Rezervovať termín');
        await expect(page).toHaveURL(/\/book/);
        await expect(page.locator('h1')).toContainText('Nová rezervácia');
    });
});
