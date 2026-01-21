import { test, expect } from '@playwright/test';

test.describe('AI Chatbot', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('should open chatbot widget', async ({ page }) => {
        const chatButton = page.locator('button[aria-label="Otvoriť chat asistenta"]');
        await chatButton.click();

        await expect(page.locator('text=BookFlow Asistent')).toBeVisible();
    });

    test('should respond to greeting', async ({ page }) => {
        const chatButton = page.locator('button[aria-label="Otvoriť chat asistenta"]');
        await chatButton.click();

        await page.fill('input[placeholder="Napíšte správu..."]', 'Ahoj');
        await page.press('input[placeholder="Napíšte správu..."]', 'Enter');

        await page.waitForTimeout(2000);
        await expect(page.getByText(/ahoj|dobrý deň/i).first()).toBeVisible();
    });

    test('should provide booking action for booking intent', async ({ page }) => {
        const chatButton = page.locator('button[aria-label="Otvoriť chat asistenta"]');
        await chatButton.click();

        await page.fill('input[placeholder="Napíšte správu..."]', 'Chcem si rezervovať termín');
        await page.press('input[placeholder="Napíšte správu..."]', 'Enter');

        await page.waitForTimeout(2000);
        await expect(page.getByText(/rezervác/i).first()).toBeVisible();
    });

    test('should answer pricing questions', async ({ page }) => {
        const chatButton = page.locator('button[aria-label="Otvoriť chat asistenta"]');
        await chatButton.click();

        await page.fill('input[placeholder="Napíšte správu..."]', 'Koľko stojí strih?');
        await page.press('input[placeholder="Napíšte správu..."]', 'Enter');

        await page.waitForTimeout(2000);
        await expect(page.getByText(/cen|€/i).first()).toBeVisible();
    });

    test('should handle reschedule intent', async ({ page }) => {
        const chatButton = page.locator('button[aria-label="Otvoriť chat asistenta"]');
        await chatButton.click();

        await page.fill('input[placeholder="Napíšte správu..."]', 'Chcem zmeniť termín');
        await page.press('input[placeholder="Napíšte správu..."]', 'Enter');

        await page.waitForTimeout(2000);
        await expect(page.getByText(/zmeni|rezervác/i).first()).toBeVisible();
    });
});
