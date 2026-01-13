import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');

        // Login as demo user
        await page.click('text=Prihlásiť sa');
        await page.fill('input[type="email"]', 'demo@bookflow.sk');
        await page.fill('input[type="password"]', 'demo123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\//);
    });

    test('should create a new booking', async ({ page }) => {
        await page.click('text=Rezervovať termín');
        await expect(page).toHaveURL(/\/book/);

        // Select service
        await page.click('.service-card:first-child');

        // Select employee
        await page.click('.employee-card:first-child');

        // Select date (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await page.fill('input[type="date"]', tomorrow.toISOString().split('T')[0]);

        // Select time slot
        await page.click('.time-slot:first-child');

        // Fill customer info
        await page.fill('input[name="customerName"]', 'Test Customer');
        await page.fill('input[name="customerEmail"]', 'customer@test.com');
        await page.fill('input[name="customerPhone"]', '123456789');

        // Submit
        await page.click('button[type="submit"]');

        // Should redirect to bookings or show success
        await page.waitForTimeout(1000);
        await expect(page.locator('text=/úspešne/i')).toBeVisible();
    });

    test('should view bookings', async ({ page }) => {
        await page.click('text=Moje rezervácie');
        await expect(page).toHaveURL(/\/my-bookings/);

        // Should show bookings list
        await expect(page.locator('h1')).toContainText('Moje rezervácie');
    });

    test('should cancel a booking', async ({ page }) => {
        await page.click('text=Moje rezervácie');
        await page.waitForURL(/\/my-bookings/);

        // Find and click cancel button (if any upcoming bookings exist)
        const cancelButton = page.locator('button:has-text("Zrušiť")').first();
        if (await cancelButton.isVisible()) {
            await cancelButton.click();

            // Confirm cancellation
            await page.locator('button:has-text("Potvrdiť")').click().catch(() => { });

            // Should show success message
            await expect(page.locator('text=/zrušená/i')).toBeVisible();
        }
    });
});
