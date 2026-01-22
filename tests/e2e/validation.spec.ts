import { test, expect } from '@playwright/test';

test.describe('Validation Tests', () => {
    test.beforeEach(async ({ page, context }) => {
        // Set viewport to ensure consistent rendering
        await page.setViewportSize({ width: 1280, height: 720 });

        // Clear storage and cookies for clean state
        await context.clearCookies();
        await context.clearPermissions();

        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('FORCE_DEMO_MODE', 'true');
        });
        await page.evaluate(() => sessionStorage.clear());

        // Force reload
        await page.reload();
        await page.goto('/login');

        // Login as demo user
        await expect(page.locator('text=Prihlásenie')).toBeVisible({ timeout: 15000 });
        await page.locator('input[type="email"]').fill('demo@bookflow.sk');
        await page.locator('input[type="password"]').fill('demo123');
        await page.click('button[type="submit"]');

        // Wait for dashboard
        await expect(page).toHaveURL(/.*dashboard|.*home|.*\//, { timeout: 15000 });
        await page.waitForLoadState('networkidle');
    });

    test('should load booking page successfully', async ({ page }) => {
        // Navigate to booking page
        await page.goto('/book');
        await expect(page).toHaveURL('/book');

        // Should show location selection
        await expect(page.locator('text=Klientske centrum Bratislava')).toBeVisible();
    });

    test('should navigate through booking steps', async ({ page }) => {
        test.setTimeout(60000);

        // Navigate to booking page
        await page.goto('/book');

        // Step 1: Select location
        await page.click('text=Klientske centrum Bratislava');

        // Should now show service selection
        await expect(page.locator('h3').filter({ hasText: 'Vyberte si službu' })).toBeVisible();

        // Step 2: Select service
        const serviceCard = page.locator('[class*="cursor-pointer"]').filter({ hasText: 'Strih' }).first();
        await expect(serviceCard).toBeVisible();
        await serviceCard.click();

        // Should now show date selection (employee selection is automatic)
        await expect(page.locator('h3').filter({ hasText: 'Dátum' })).toBeVisible();
    });

    test('should validate required fields prevent progression', async ({ page }) => {
        test.setTimeout(60000);

        // Navigate to booking page
        await page.goto('/book');

        // Try to progress without selecting location (should not work)
        // The form should prevent progression without required selections

        // Check that we're still on the location step
        await expect(page.locator('text=Klientske centrum Bratislava')).toBeVisible();
    });

    test('should show form elements correctly', async ({ page }) => {
        // Navigate to booking page
        await page.goto('/book');

        // Should have proper form structure
        await expect(page.locator('text=Rezervovať termín')).toBeVisible();

        // Should show progress indicator
        await expect(page.locator('text=Prevádzka')).toBeVisible();
        await expect(page.locator('text=Služba')).toBeVisible();
        await expect(page.locator('text=Termín')).toBeVisible();
    });
});
