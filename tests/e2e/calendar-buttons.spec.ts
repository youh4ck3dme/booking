import { test, expect } from '@playwright/test';

test.describe('Calendar View Switching', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set viewport to ensure consistent rendering
    await page.setViewportSize({ width: 1280, height: 720 });

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

    // Login as demo user
    await page.locator('input[type="email"]').fill('demo@bookflow.sk');
    await page.locator('input[type="password"]').fill('demo123');
    await page.click('button[type="submit"]');

    // Wait for dashboard or home redirect
    await expect(page).toHaveURL(/.*dashboard|.*home|.*\//, { timeout: 15000 });

    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');
  });

  test('should switch between calendar views', async ({ page }) => {
    // Navigate to calendar via sidebar
    await page.click('[aria-label="Otvoriť menu"], [aria-label="Menu"]');
    await page.click('text=Kalendár');

    // Check if we're on calendar page
    await expect(page).toHaveURL('/calendar');
    await expect(page.locator('h1').filter({ hasText: 'Kalendár' })).toBeVisible();

    // Test month view (default)
    const monthButton = page.locator('button').filter({ hasText: 'Mesiac' });
    await expect(monthButton).toHaveClass(/bg-primary/); // Should be active

    // Switch to week view
    const weekButton = page.locator('button').filter({ hasText: 'Týždeň' });
    await weekButton.click();

    // Check if week view is active and content changed
    await expect(weekButton).toHaveClass(/bg-primary/);
    await expect(page.locator('h1').filter({ hasText: 'Týždenný pohľad' })).toBeVisible();

    // Check week navigation buttons
    await expect(page.locator('button').filter({ hasText: 'Dnes' })).toBeVisible();
    await expect(page.locator('button[aria-label="Predchádzajúci týždeň"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Nasledujúci týždeň"]')).toBeVisible();

    // Switch to day view
    const dayButton = page.locator('button').filter({ hasText: 'Deň' });
    await dayButton.click();

    // Check if day view is active
    await expect(dayButton).toHaveClass(/bg-primary/);

    // Switch back to month view
    await monthButton.click();
    await expect(monthButton).toHaveClass(/bg-primary/);
    await expect(page.locator('h1').filter({ hasText: 'Kalendár' })).toBeVisible();
  });

  test('should show calendar content in month view', async ({ page }) => {
    // Navigate to calendar via sidebar
    await page.click('[aria-label="Otvoriť menu"], [aria-label="Menu"]');
    await page.click('text=Kalendár');

    // Should show month grid
    await expect(page.locator('[class*="grid-cols-7"]')).toBeVisible();

    // Should show day headers (Mon, Tue, Wed, etc.)
    await expect(page.locator('text=Mon')).toBeVisible();
    await expect(page.locator('text=Tue')).toBeVisible();
    await expect(page.locator('text=Wed')).toBeVisible();
  });

  test('should show calendar content in week view', async ({ page }) => {
    // Navigate to calendar via sidebar
    await page.click('[aria-label="Otvoriť menu"], [aria-label="Menu"]');
    await page.click('text=Kalendár');

    // Switch to week view
    const weekButton = page.locator('button').filter({ hasText: 'Týždeň' });
    await weekButton.click();

    // Should show time slots
    await expect(page.locator('text=9:00')).toBeVisible();
    await expect(page.locator('text=10:00')).toBeVisible();

    // Should show day columns
    await expect(page.locator('[class*="grid-cols-8"]')).toBeVisible();
  });
});
