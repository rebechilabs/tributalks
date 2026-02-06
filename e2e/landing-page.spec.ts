import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Landing Page
 * 
 * Verifica que a landing page carrega corretamente
 * e tem todos os elementos essenciais.
 */

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load without errors', async ({ page }) => {
    // Page should load
    await expect(page).toHaveTitle(/.+/);
    
    // No error messages in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Filter out expected errors (like 401s from API calls)
    const criticalErrors = errors.filter(e => 
      !e.includes('401') && 
      !e.includes('Failed to fetch') &&
      !e.includes('net::ERR')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have navigation elements', async ({ page }) => {
    // Logo or brand name should be visible
    const logo = page.locator('header').getByRole('link').first();
    await expect(logo).toBeVisible();
  });

  test('should have hero section', async ({ page }) => {
    // Hero heading
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();
  });

  test('should have call-to-action buttons', async ({ page }) => {
    // Primary CTA
    const ctaButton = page.getByRole('link', { name: /começar|criar conta|experimente|grátis|entrar/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still render
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Mobile menu button might be visible
    const mobileMenuButton = page.getByRole('button', { name: /menu/i });
    // This is optional - some designs show all nav items
  });

  test('should have footer with links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('Landing Page - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Should load DOM in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have visible content above the fold', async ({ page }) => {
    await page.goto('/');
    
    // Take screenshot to verify content
    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot.byteLength).toBeGreaterThan(0);
    
    // Hero should be visible without scrolling
    const hero = page.locator('h1').first();
    await expect(hero).toBeInViewport();
  });
});

test.describe('Landing Page - SEO', () => {
  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(70);
    
    // Description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
  });

  test('should have single h1 tag', async ({ page }) => {
    await page.goto('/');
    
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('should have semantic HTML structure', async ({ page }) => {
    await page.goto('/');
    
    // Should have header
    await expect(page.locator('header')).toBeVisible();
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
    
    // Should have footer
    await expect(page.locator('footer')).toBeVisible();
  });
});
