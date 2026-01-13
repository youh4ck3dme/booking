import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');

        // Login as admin
        await page.click('text=Prihlásiť sa');
        await page.fill('input[type="email"]', 'admin@bookflow.sk');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\//);
    });

    test('should access dashboard as admin', async ({ page }) => {
        await page.click('text=Dashboard');
        await expect(page).toHaveURL(/\/dashboard/);

        // Admin should see admin-specific features
        await expect(page.locator('text=Správa zamestnancov')).toBeVisible();
        await expect(page.locator('text=Blokovať')).toBeVisible();
    });

    test('should navigate to staff management', async ({ page }) => {
        await page.click('text=Dashboard');
        await page.click('text=Správa zamestnancov');
        await expect(page).toHaveURL(/\/staff/);

        await expect(page.locator('h1')).toContainText('Správa zamestnancov');
    });

    test('should add new employee', async ({ page }) => {
        await page.goto('http://localhost:5173/staff');

        await page.click('text=Pridať zamestnanca');

        // Fill employee form
        await page.fill('input[name="name"]', 'New Employee');
        await page.fill('input[name="email"]', 'newemp@test.com');
        await page.fill('input[name="phone"]', '+421901999999');

        // Select color
        await page.locator('input[type="color"]').first().click();

        // Save
        await page.click('button:has-text("Uložiť")');

        // Should show in list
        await expect(page.locator('text=New Employee')).toBeVisible();
    });

    test('should block time from dashboard', async ({ page }) => {
        await page.goto('http://localhost:5173/dashboard');

        await page.click('button:has-text("Blokovať")');

        // Should show time blocking prompt or modal
        await page.waitForTimeout(500);
    });

    test('should access settings', async ({ page }) => {
        await page.goto('http://localhost:5173/dashboard');

        await page.locator('text=Nastavenia').first().click();
        await expect(page).toHaveURL(/\/settings/);

        await expect(page.locator('h1')).toContainText('Nastavenia');
    });

    test('should access statistics', async ({ page }) => {
        await page.goto('http://localhost:5173/dashboard');

        await page.click('text=Štatistiky');
        await expect(page).toHaveURL(/\/statistics/);

        await expect(page.locator('h1')).toContainText('Štatistiky');
    });
});
