import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
    test.beforeEach(async ({ page, context }) => {
        // Debug console
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        
        // Essential: Clear everything to ensure strict isolation
        await context.clearCookies();
        await context.clearPermissions();
        
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('FORCE_DEMO_MODE', 'true');
        });
        await page.evaluate(() => sessionStorage.clear());
        
        // Force reload to ensure app picks up empty storage and demo mode
        await page.reload();
        await page.goto('/login');
        
        // Wait for login page
        await expect(page.locator('text=Prihlásenie')).toBeVisible({ timeout: 15000 });
        
        // Login as admin
        await page.locator('input[type="email"]').fill('admin@bookflow.sk');
        await page.locator('input[type="password"]').fill('admin123');
        await page.click('button[type="submit"]');
        
        // Wait for dashboard or home redirect
        await expect(page).toHaveURL(/.*dashboard|.*home|.*\//, { timeout: 15000 });
    });

    test('should access dashboard features as admin', async ({ page }) => {
        // Verify Dashboard specific elements (avoiding hidden sidebar items)
        await expect(page.locator('h1').filter({ hasText: /Vitajte/ }).first()).toBeVisible();
        await expect(page.locator('text=Rýchle akcie')).toBeVisible();
        
        // Check for admin buttons in Quick Actions (inside the main container)
        // We use a specific locator for the main content area to avoid sidebar ambiguity
        const quickActions = page.locator('.glass-card', { hasText: 'Rýchle akcie' });
        await expect(quickActions.locator('text=Zamestnanci')).toBeVisible();
    });

    test('should navigate to staff management', async ({ page }) => {
        // Open sidebar
        await page.click('[aria-label="Otvoriť menu"], [aria-label="Menu"]');
        
        // Click Zamestnanci
        await page.click('text=Zamestnanci');
        
        await expect(page).toHaveURL(/\/staff/);
        await expect(page.locator('h1, h2, h3').filter({ hasText: 'Správa zamestnancov' }).first()).toBeVisible({ timeout: 10000 });
    });

    test('should add new employee', async ({ page }) => {
        // Navigate via Sidebar
        await page.click('[aria-label="Otvoriť menu"], [aria-label="Menu"]');
        await page.click('text=Zamestnanci');
        await expect(page).toHaveURL(/\/staff/);

        await page.click('text=Pridať zamestnanca');

        // Fill employee form
        await page.getByLabel('Meno a priezvisko').fill('New Employee');
        await page.getByLabel('Email').fill('newemp@test.com');
        await page.getByLabel('Telefón').fill('+421901999999');

        // Save
        await page.click('button:has-text("Uložiť")');

        // Should show in list
        await expect(page.locator('text=New Employee')).toBeVisible();
    });

    test('should access settings', async ({ page }) => {
        // Open sidebar
        await page.click('[aria-label="Otvoriť menu"], [aria-label="Menu"]');
        await page.click('text=Nastavenia');
        await expect(page).toHaveURL(/\/settings/);
        await expect(page.locator('h1, h2, h3').filter({ hasText: 'Nastavenia' }).first()).toBeVisible();
    });

    test('should access statistics', async ({ page }) => {
        // Open sidebar
        await page.click('[aria-label="Otvoriť menu"], [aria-label="Menu"]');
        await page.click('text=Štatistiky');
        await expect(page).toHaveURL(/\/statistics/);
        await expect(page.locator('h1, h2, h3').filter({ hasText: 'Štatistiky' }).first()).toBeVisible();
    });
});
