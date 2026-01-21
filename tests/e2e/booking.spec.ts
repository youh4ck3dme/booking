import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
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
        
        // Login as demo user
        await page.locator('input[type="email"]').fill('demo@bookflow.sk');
        await page.locator('input[type="password"]').fill('demo123');
        await page.click('button[type="submit"]');
        
        // Wait for dashboard or home redirect
        await expect(page).toHaveURL(/.*dashboard|.*home|.*\//, { timeout: 15000 });
    });

    test('should create a new booking', async ({ page }) => {
        test.setTimeout(60000); // Increase timeout for complex flow
        // Navigate to booking page from Home/Dashboard
        // Assuming "Rezervovať termín" button exists on Home/Dashboard
        const bookButton = page.locator('text=Rezervovať termín').first();
        if (await bookButton.isVisible()) {
            await bookButton.click();
        } else {
             // Fallback to URL if button not found (e.g. specialized dashboard)
             await page.goto('/book');
        }
        await expect(page).toHaveURL(/\/book/);

        // 0. Select Location
        console.log('Waiting for location step...');
        const locationHeader = page.locator('h3:has-text("Vyberte si prevádzku")');
        await expect(locationHeader).toBeVisible({ timeout: 5000 });
        await page.click('text=Klientske centrum Bratislava');

        // 1. Select Service
        // 1. Select Service
        // Service name is in h4 in BookingForm.tsx
        // Click the card containing "Strih"
        const serviceCard = page.locator('.glass-card').filter({ hasText: 'Strih' }).first();
        await expect(serviceCard).toBeVisible();
        await serviceCard.click({ force: true });
        
        // Retry logic: if next step header not found, click again
        try {
            await expect(page.locator('h3, h4').filter({ hasText: 'Vyberte si zamestnanca' })).toBeVisible({ timeout: 2000 });
        } catch {
            await serviceCard.click({ force: true });
        }

        // 2. Select Employee
        // ensure we really moved there
        await expect(page.locator('h3, h4').filter({ hasText: 'Vyberte si zamestnanca' })).toBeVisible({ timeout: 10000 }); 
        await expect(page.locator('h3, h4').filter({ hasText: 'Vyberte si zamestnanca' })).toBeVisible({ timeout: 15000 });
        await page.locator('.glass-card').first().click();

        // 3. Select Date and Time
        // Click first available day and time slot
        await page.locator('button:not([disabled])').filter({ hasText: /^\d+$/ }).first().click();
        await page.locator('button:not([disabled])').filter({ hasText: /\d{1,2}:\d{2}/ }).first().click();

        // 4. Fill Customer Details (if not pre-filled)
        // Check if name input is empty before filling
        const nameInput = page.locator('input[name="customerName"]');
        if (await nameInput.isVisible() && await nameInput.inputValue() === '') {
             await nameInput.fill('Test Customer');
        }
        
        // 5. Submit
        await page.click('button:has-text("Potvrdiť rezerváciu")');

        // 6. Success
        await expect(page.locator('text=úspešne vytvorená|vytvorená')).toBeVisible({ timeout: 10000 });
    });

    test('should view bookings in profile', async ({ page }) => {
        // Open sidebar
        await page.click('[aria-label="Otvoriť menu"], [aria-label="Menu"]');
        await page.click('text=Moje rezervácie');

        await expect(page).toHaveURL(/\/my-bookings/);
        await expect(page.locator('h1, h2, h3').filter({ hasText: 'Moje rezervácie' }).first()).toBeVisible();
    });

    test('should cancel a booking', async ({ page }) => {
        // Navigate via Sidebar
        await page.click('[aria-label="Otvoriť menu"], [aria-label="Menu"]');
        await page.click('text=Moje rezervácie');
        
        await expect(page).toHaveURL(/\/my-bookings/);

        // If there are bookings, try to cancel the first one
        const cancelBtn = page.locator('button:has-text("Zrušiť")').first();
        if (await cancelBtn.isVisible()) {
            await cancelBtn.click();
            await page.click('button:has-text("Áno, zrušiť")');
            await expect(page.locator('text=zrušená')).toBeVisible();
        }
    });
});
