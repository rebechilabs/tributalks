import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Authentication Flow
 * 
 * Testa o fluxo crítico: Login → Setup → Dashboard
 * Este é o path mais importante para novos usuários.
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
  });

  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
    
    // Login form should be visible
    await expect(page.getByRole('heading', { name: /entrar|login/i })).toBeVisible();
  });

  test('should display login form with email and password fields', async ({ page }) => {
    await page.goto('/login');
    
    // Check form elements
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar|login/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill invalid credentials
    await page.getByLabel(/e-?mail/i).fill('invalid@test.com');
    await page.getByLabel(/senha/i).fill('wrongpassword');
    await page.getByRole('button', { name: /entrar|login/i }).click();
    
    // Should show error message
    await expect(page.getByText(/inválid|erro|incorrect/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show signup link on login page', async ({ page }) => {
    await page.goto('/login');
    
    // Signup link should be visible
    await expect(page.getByRole('link', { name: /criar conta|cadastr|registr/i })).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');
    
    // Click signup link
    await page.getByRole('link', { name: /criar conta|cadastr|registr/i }).click();
    
    // Should be on signup page
    await expect(page).toHaveURL(/\/(cadastro|signup|register)/);
  });

  test('should display signup form correctly', async ({ page }) => {
    await page.goto('/cadastro');
    
    // Check form elements
    await expect(page.getByLabel(/nome/i)).toBeVisible();
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /criar|cadastr|registr/i })).toBeVisible();
  });

  test('should validate email format on signup', async ({ page }) => {
    await page.goto('/cadastro');
    
    // Fill form with invalid email
    await page.getByLabel(/nome/i).fill('Test User');
    await page.getByLabel(/e-?mail/i).fill('invalid-email');
    await page.getByLabel(/senha/i).first().fill('validpassword123');
    
    // Try to submit
    await page.getByRole('button', { name: /criar|cadastr|registr/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/e-?mail.*inválid|invalid.*email/i)).toBeVisible({ timeout: 5000 });
  });

  test('landing page should have call-to-action buttons', async ({ page }) => {
    await page.goto('/');
    
    // Should have CTA buttons
    const ctaButtons = page.getByRole('link', { name: /começar|criar conta|experimente|grátis/i });
    await expect(ctaButtons.first()).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect /dashboard to /login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect /dashboard/home to /login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/home');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect /setup to /login when not authenticated', async ({ page }) => {
    await page.goto('/setup');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect /clara to /login when not authenticated', async ({ page }) => {
    await page.goto('/clara');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Public Routes', () => {
  test('should access landing page without authentication', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Should not redirect
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/');
  });

  test('should access login page without authentication', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should access signup page without authentication', async ({ page }) => {
    await page.goto('/cadastro');
    await expect(page).toHaveURL(/\/cadastro/);
  });
});
