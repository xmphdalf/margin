import { test, expect } from '@playwright/test';

test.describe('Paste input', () => {
	test('submitting markdown via button navigates to /read/ and renders document', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const textarea = page.locator('#markdown-input');
		await textarea.fill('# Hello Paste\n\nSome content here.');

		// Button enables once textarea has content
		const btn = page.getByRole('button', { name: /Read/ });
		await expect(btn).toBeEnabled();
		await btn.click();

		await expect(page).toHaveURL(/\/read\//);
		await expect(page.locator('article h1')).toContainText('Hello Paste');
	});

	test('Ctrl+Enter keyboard shortcut also submits', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const textarea = page.locator('#markdown-input');
		await textarea.fill('# Keyboard Submit\n\nContent.');
		await textarea.press('Control+Enter');

		await expect(page).toHaveURL(/\/read\//);
		await expect(page.locator('article h1')).toContainText('Keyboard Submit');
	});

	test('frontmatter title is surfaced in the page title', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const textarea = page.locator('#markdown-input');
		await textarea.fill('---\ntitle: My Doc\nauthor: Test\n---\n\n# Body Heading\n\nContent.');

		const btn = page.getByRole('button', { name: /Read/ });
		await expect(btn).toBeEnabled();
		await btn.click();

		await expect(page).toHaveURL(/\/read\//);
		await expect(page).toHaveTitle(/My Doc/);
	});
});
