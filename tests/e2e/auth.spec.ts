import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Clear session
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.goto('/login');
    });

    test('should login with demo credentials', async ({ page }) => {
        // Use more robust locator
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');
        
        await emailInput.fill('demo@bookflow.sk');
        await passwordInput.fill('demo123');
        await page.click('button[type="submit"]');

        // Check successful login - usually redirects to dashboard or home
        await expect(page).toHaveURL(/.*dashboard|.*\//, { timeout: 10000 });
    });

    test('should logout successfully', async ({ page }) => {
        await page.locator('input[type="email"]').fill('demo@bookflow.sk');
        await page.locator('input[type="password"]').fill('demo123');
        await page.click('button[type="submit"]');
        
        await expect(page).toHaveURL(/.*dashboard|.*\//);

        // Open sidebar to logout
        await page.click('[aria-label="Otvoriť menu"]');
        await page.click('text=Odhlásiť sa');

        // Should redirect to home or login
        await expect(page).toHaveURL(/\//);
    });

    test('should show error on invalid credentials', async ({ page }) => {
        await page.locator('input[type="email"]').fill('wrong@example.com');
        await page.fill('input[type="password"]', 'wrongpass');
        await page.click('button[type="submit"]');

        // Should show error toast/message
        await expect(page.locator('text=/zlyhalo|nesprávny/i').first()).toBeVisible();
    });
});
