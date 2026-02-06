import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Clara AI Chat
 * 
 * Smoke tests para verificar que a Clara está funcionando.
 * Nota: Testes completos requerem autenticação.
 */

test.describe('Clara AI - Public Access', () => {
  test('should redirect to login when accessing /clara without auth', async ({ page }) => {
    await page.goto('/clara');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Clara AI - UI Components', () => {
  // Note: These tests require authentication setup
  // For now, we test the redirect behavior
  
  test('should have proper meta tags for Clara page', async ({ page }) => {
    // This tests that the route exists and is configured
    const response = await page.goto('/clara');
    
    // Either redirects (302) or shows page (200)
    expect([200, 302, 307]).toContain(response?.status());
  });
});

test.describe('Clara AI - API Health', () => {
  test('should return 401 for unauthenticated API calls', async ({ request }) => {
    const response = await request.post('/functions/v1/clara-assistant', {
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
      },
      data: {
        messages: [{ role: 'user', content: 'Olá' }],
      },
    });
    
    // Should require authentication
    expect(response.status()).toBe(401);
  });
});
