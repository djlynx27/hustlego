/**
 * admin.spec.ts — HustleGo E2E
 *
 * Teste AdminScreen :
 *   - Section "Calibration IA" avec WeightCalibratorPanel
 *   - Rapport de revenus
 *   - ShiftOptimizer (planning)
 */

import { expect, test } from '@playwright/test';
import { mockSupabase } from './helpers/supabase-mock';

test.describe('AdminScreen — Calibration IA', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/admin');
    await expect(page.getByText('Un problème est survenu')).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("l'écran admin charge sans crash", async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('la section "Calibration IA" est visible', async ({ page }) => {
    await expect(page.getByText('Calibration IA')).toBeVisible({
      timeout: 8000,
    });
  });

  test('le WeightCalibratorPanel affiche les labels de poids', async ({
    page,
  }) => {
    // Les labels de poids sont fixes dans le composant
    const panel = page.getByText('Calibration IA').locator('../..');
    // Attendre que le panel charge (GET /functions/v1/weight-calibrator)
    await expect(panel).toBeVisible();
    // Les barres de poids ont des labels emoji fixes
    await expect(page.getByText('🕐 Heure')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('📅 Jour')).toBeVisible();
    await expect(page.getByText('🌧 Météo')).toBeVisible();
  });

  test('le bouton Calibrer est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Calibrer/i })).toBeVisible({
      timeout: 8000,
    });
  });

  test('le lien /admin est actif dans la nav', async ({ page }) => {
    const adminLink = page.locator('nav a[href="/admin"]');
    await expect(adminLink).toHaveClass(/text-primary/);
  });
});

test.describe('AdminScreen — Navigation sortante', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/admin');
  });

  test('peut revenir à TodayScreen', async ({ page }) => {
    await page.locator('nav a[href="/"]').click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Un problème est survenu')).not.toBeVisible();
  });

  test('peut aller vers DriveScreen', async ({ page }) => {
    await page.locator('nav a[href="/drive"]').click();
    await expect(page).toHaveURL('/drive');
  });
});
