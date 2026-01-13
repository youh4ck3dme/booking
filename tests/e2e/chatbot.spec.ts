import { test, expect } from '@playwright/test';

test.describe('AI Chatbot', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('should open chatbot widget', async ({ page }) => {
        const chatButton = page.locator('.chatbot-toggle, button:has-text("Chat")');
        await chatButton.click();

        await expect(page.locator('.chat-widget, .chatbot-widget')).toBeVisible();
    });

    test('should respond to greeting', async ({ page }) => {
        const chatButton = page.locator('.chatbot-toggle, button:has-text("Chat")');
        await chatButton.click();

        await page.fill('.chat-input, input[placeholder*="správ"]', 'Ahoj');
        await page.press('.chat-input, input[placeholder*="správ"]', 'Enter');

        await page.waitForTimeout(2000);
        await expect(page.locator('.chat-messages, .chat-message')).toContainText(/ahoj|dobrý deň/i);
    });

    test('should provide booking action for booking intent', async ({ page }) => {
        const chatButton = page.locator('.chatbot-toggle, button:has-text("Chat")');
        await chatButton.click();

        await page.fill('.chat-input, input[placeholder*="správ"]', 'Chcem si rezervovať termín');
        await page.press('.chat-input, input[placeholder*="správ"]', 'Enter');

        await page.waitForTimeout(2000);
        await expect(page.locator('.chat-action, button:has-text("rezervác")')).toBeVisible();
    });

    test('should answer pricing questions', async ({ page }) => {
        const chatButton = page.locator('.chatbot-toggle, button:has-text("Chat")');
        await chatButton.click();

        await page.fill('.chat-input, input[placeholder*="správ"]', 'Koľko stojí strih?');
        await page.press('.chat-input, input[placeholder*="správ"]', 'Enter');

        await page.waitForTimeout(2000);
        await expect(page.locator('.chat-messages')).toContainText(/cen|€/i);
    });

    test('should handle reschedule intent', async ({ page }) => {
        const chatButton = page.locator('.chatbot-toggle, button:has-text("Chat")');
        await chatButton.click();

        await page.fill('.chat-input, input[placeholder*="správ"]', 'Chcem zmeniť termín');
        await page.press('.chat-input, input[placeholder*="správ"]', 'Enter');

        await page.waitForTimeout(2000);
        await expect(page.locator('.chat-messages')).toContainText(/zmeni|rezervác/i);
    });
});
