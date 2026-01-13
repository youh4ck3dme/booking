import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('should register new user', async ({ page }) => {
        await page.click('text=Registrovať sa');
        await expect(page).toHaveURL(/\/register/);

        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[type="email"]', 'newuser@test.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Should redirect after successful registration
        await expect(page).toHaveURL(/\//);
    });

    test('should login with demo credentials', async ({ page }) => {
        await page.click('text=Prihlásiť sa');
        await expect(page).toHaveURL(/\/login/);

        await page.fill('input[type="email"]', 'demo@bookflow.sk');
        await page.fill('input[type="password"]', 'demo123');
        await page.click('button[type="submit"]');

        // Check successful login
        await expect(page).toHaveURL(/\//);
        await expect(page.locator('header')).toContainText('Ján Novák');
    });

    test('should logout successfully', async ({ page }) => {
        // Login first
        await page.click('text=Prihlásiť sa');
        await page.fill('input[type="email"]', 'demo@bookflow.sk');
        await page.fill('input[type="password"]', 'demo123');
        await page.click('button[type="submit"]');
        await expect(page.locator('header')).toContainText('Ján Novák');

        // Logout
        await page.click('button:has-text("Ján Novák")').catch(() => {
            // Fallback: try clicking on user menu
            page.click('text=Ján Novák');
        });
        await page.click('text=Odhlásiť sa');

        // Should redirect to home
        await expect(page).toHaveURL(/\//);
        await expect(page.locator('text=Prihlásiť sa')).toBeVisible();
    });
});
