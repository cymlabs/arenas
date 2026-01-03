import { test, expect } from '@playwright/test';

const envReady = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

test.describe('ARENAS smoke', () => {
  test.skip(!envReady, 'Supabase environment variables are required to run smoke tests.');

  test('home renders explore prompt', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('ARENAS')).toBeVisible();
    await expect(page.getByText('Battle', { exact: false })).toBeVisible();
  });

  test('admin console loads', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('Algorithm controls')).toBeVisible();
  });
});
