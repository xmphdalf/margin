import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_MD = path.join(__dirname, 'fixtures', 'sample.md');

test.describe('Upload input', () => {
	test('uploading a valid .md file navigates to /read/ and renders document', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await page.locator('#tab-upload').click();

		const fileInput = page.locator('input[type="file"]');
		await expect(fileInput).toBeAttached();
		await fileInput.setInputFiles(FIXTURE_MD);

		await expect(page).toHaveURL(/\/read\//);
		await expect(page.locator('article h1')).toContainText('Sample Upload Document');
	});

	test('uploading a .pdf file shows an error and stays on home page', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await page.locator('#tab-upload').click();

		const fileInput = page.locator('input[type="file"]');
		await expect(fileInput).toBeAttached();
		await fileInput.setInputFiles({
			name: 'document.pdf',
			mimeType: 'application/pdf',
			buffer: Buffer.from('%PDF-1.4 fake pdf content'),
		});

		await expect(page.getByRole('alert')).toHaveText(
			'Please upload a .md, .markdown, or .txt file.'
		);
		await expect(page).toHaveURL('/');
	});

	test('uploading a valid .txt file also works', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await page.locator('#tab-upload').click();

		const fileInput = page.locator('input[type="file"]');
		await expect(fileInput).toBeAttached();
		await fileInput.setInputFiles({
			name: 'notes.txt',
			mimeType: 'text/plain',
			buffer: Buffer.from('# Text File\n\nPlain text content.'),
		});

		await expect(page).toHaveURL(/\/read\//);
		await expect(page.locator('article h1')).toContainText('Text File');
	});
});
