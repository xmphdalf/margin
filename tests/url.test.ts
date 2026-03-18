import { test, expect } from '@playwright/test';

const RAW_URL = 'https://raw.githubusercontent.com/test/repo/main/README.md';
const BLOB_URL = 'https://github.com/test/repo/blob/main/README.md';

test.describe('URL input', () => {
	test('valid URL fetches markdown and navigates to /read/', async ({ page }) => {
		await page.route(RAW_URL, (route) =>
			route.fulfill({
				status: 200,
				contentType: 'text/plain',
				body: '# Fetched Document\n\nContent from the mocked URL.',
			})
		);

		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await page.locator('#tab-url').click();

		const urlInput = page.locator('#url-input');
		await expect(urlInput).toBeAttached();
		await urlInput.fill(RAW_URL);
		await page.getByRole('button', { name: /Fetch/ }).click();

		await expect(page).toHaveURL(/\/read\//);
		await expect(page.locator('article h1')).toContainText('Fetched Document');
	});

	test('GitHub blob URL is auto-normalized to raw before fetch', async ({ page }) => {
		// normalizeGitHubUrl() converts blob → raw before calling fetch,
		// so we intercept the raw URL even though the user typed the blob URL.
		await page.route(RAW_URL, (route) =>
			route.fulfill({
				status: 200,
				contentType: 'text/plain',
				body: '# From GitHub Blob\n\nNormalized successfully.',
			})
		);

		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await page.locator('#tab-url').click();

		const urlInput = page.locator('#url-input');
		await expect(urlInput).toBeAttached();
		await urlInput.fill(BLOB_URL);
		await page.getByRole('button', { name: /Fetch/ }).click();

		await expect(page).toHaveURL(/\/read\//);
		await expect(page.locator('article h1')).toContainText('From GitHub Blob');
	});

	test('invalid URL format shows error and stays on home page', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await page.locator('#tab-url').click();

		const urlInput = page.locator('#url-input');
		await expect(urlInput).toBeAttached();
		// ftp:// passes browser type="url" validation but fails isValidUrl() (requires http/https)
		await urlInput.fill('ftp://example.com/file.md');
		await page.getByRole('button', { name: /Fetch/ }).click();

		await expect(page.getByRole('alert')).toHaveText(
			'Please enter a valid https:// URL.'
		);
		await expect(page).toHaveURL('/');
	});

	test('URL that returns HTTP error shows error message', async ({ page }) => {
		const FAILING_URL = 'https://raw.githubusercontent.com/test/repo/main/missing.md';

		await page.route(FAILING_URL, (route) =>
			route.fulfill({ status: 404, body: 'Not Found' })
		);

		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await page.locator('#tab-url').click();

		const urlInput = page.locator('#url-input');
		await expect(urlInput).toBeAttached();
		await urlInput.fill(FAILING_URL);
		await page.getByRole('button', { name: /Fetch/ }).click();

		await expect(page.getByRole('alert')).toContainText('404');
		await expect(page).toHaveURL('/');
	});
});
