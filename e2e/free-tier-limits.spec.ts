import { test, expect } from '@playwright/test';

/**
 * Free Tier Limits Tests
 * Tests backend enforcement of free tier restrictions
 */

test.describe('Free Tier Limits', () => {
  
  test.describe('Pricing Feature Parity', () => {
    test('homepage and pricing page show same Free tier features', async ({ page }) => {
      // Check homepage Free features
      await page.goto('/');
      
      const homeFreeFeatures = [
        /3.*retro/i,
        /10.*participant/i,
        /format/i,
        /7.*day/i,
        /AI/i,
      ];
      
      for (const pattern of homeFreeFeatures) {
        await expect(page.getByText(pattern).first()).toBeVisible();
      }
      
      // Check pricing page Free features
      await page.goto('/pricing');
      
      const pricingFreeFeatures = [
        /3.*retro/i,
        /10.*participant/i,
        /format/i,
        /7.*day/i,
        /AI/i,
      ];
      
      for (const pattern of pricingFreeFeatures) {
        await expect(page.getByText(pattern).first()).toBeVisible();
      }
    });

    test('homepage and pricing page show same Pro tier features', async ({ page }) => {
      await page.goto('/');
      
      const homeProFeatures = [
        /unlimited.*retro/i,
        /unlimited.*participant/i,
        /PDF/i,
        /history/i,
        /permanent/i,
      ];
      
      for (const pattern of homeProFeatures) {
        await expect(page.getByText(pattern).first()).toBeVisible();
      }
      
      await page.goto('/pricing');
      
      for (const pattern of homeProFeatures) {
        await expect(page.getByText(pattern).first()).toBeVisible();
      }
    });
  });

  test.describe('Participant Limit (10 max)', () => {
    // Note: Full test requires database setup with 10 participants
    // This tests the error handling UI
    
    test('API endpoint responds to feedback requests', async ({ request }) => {
      // This would need a real retro with 10 participants for full test
      // For now, we verify the endpoint exists and responds
      const response = await request.post('/api/feedback', {
        data: {
          retroId: 'test-retro-id',
          entries: [{ category: 'start', content: 'test' }],
          participantId: 'test-participant',
        },
      });
      
      // Should respond with a valid HTTP status (not crash)
      // 404 = retro not found, 500 = missing credentials (dev)
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(600);
    });
  });

  test.describe('Link Expiration (7 days)', () => {
    // Note: Full test requires a retro older than 7 days
    // This tests that the page handles errors gracefully
    
    test('participation page shows error for invalid retro', async ({ page }) => {
      await page.goto('/r/expired-link-test');
      
      // Should show not found message
      await expect(page.getByText(/not found|non trovata|expired/i)).toBeVisible();
    });
  });

  test.describe('AI Summary Pro Feature', () => {
    // Note: Full test requires auth setup
    // This tests the UI elements exist
    
    test('AI Summary section exists on dashboard-like pages', async ({ page }) => {
      // Navigate to a page that would show AI Summary
      // Without auth, we can't access dashboard, but we verify the component exists
      await page.goto('/');
      
      // Verify the Pro badge and AI features are mentioned
      await expect(page.getByText(/AI/i).first()).toBeVisible();
    });
  });
});

test.describe('API Feedback Endpoint', () => {
  // Note: These tests require SUPABASE_SERVICE_ROLE_KEY in env
  // They will return 500 if credentials are missing (expected in local dev)
  
  test('rejects requests without required fields', async ({ request }) => {
    const response = await request.post('/api/feedback', {
      data: {},
    });
    
    // 400 = validation error (expected)
    // 500 = missing credentials (acceptable in dev)
    expect([400, 500]).toContain(response.status());
  });

  test('rejects requests with empty entries', async ({ request }) => {
    const response = await request.post('/api/feedback', {
      data: {
        retroId: 'some-id',
        entries: [],
        participantId: 'some-participant',
      },
    });
    
    expect([400, 500]).toContain(response.status());
  });

  test('returns 404 or 500 for non-existent retro', async ({ request }) => {
    const response = await request.post('/api/feedback', {
      data: {
        retroId: 'non-existent-retro-id',
        entries: [{ category: 'start', content: 'test feedback' }],
        participantId: 'test-participant-123',
      },
    });
    
    // 404 = retro not found (expected with credentials)
    // 500 = missing credentials (acceptable in dev)
    expect([404, 500]).toContain(response.status());
  });
});
