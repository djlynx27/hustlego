import { describe, it, expect } from 'vitest';
import {
  validateGeminiScore,
  computeFirewallMetrics,
  FIREWALL_MAX_DRIFT,
} from '@/lib/scoreValidator';

describe('validateGeminiScore', () => {
  it('accepts a valid score within drift threshold', () => {
    const result = validateGeminiScore(60, 50);
    expect(result.passed).toBe(true);
    expect(result.finalScore).toBe(60);
    expect(result.reason).toBe('accepted');
  });

  it('rejects non-number input (invalid_type)', () => {
    const result = validateGeminiScore('high', 50);
    expect(result.passed).toBe(false);
    expect(result.finalScore).toBe(50); // falls back to baseline
    expect(result.reason).toBe('invalid_type');
  });

  it('rejects NaN (invalid_type)', () => {
    const result = validateGeminiScore(NaN, 40);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('invalid_type');
  });

  it('rejects a score below 0 (out_of_range)', () => {
    const result = validateGeminiScore(-5, 50);
    expect(result.passed).toBe(false);
    expect(result.finalScore).toBe(0);
    expect(result.reason).toBe('out_of_range');
  });

  it('rejects a score above 100 (out_of_range)', () => {
    const result = validateGeminiScore(120, 50);
    expect(result.passed).toBe(false);
    expect(result.finalScore).toBe(100);
    expect(result.reason).toBe('out_of_range');
  });

  it('clamps a score that drifts beyond MAX_DRIFT above baseline', () => {
    const baseline = 40;
    const geminiScore = 40 + FIREWALL_MAX_DRIFT + 10; // 85 — too high
    const result = validateGeminiScore(geminiScore, baseline);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('clamped_drift');
    expect(result.finalScore).toBe(baseline + FIREWALL_MAX_DRIFT); // 75
  });

  it('clamps a score that drifts beyond MAX_DRIFT below baseline', () => {
    const baseline = 80;
    const geminiScore = 80 - FIREWALL_MAX_DRIFT - 10; // 35 — too low
    const result = validateGeminiScore(geminiScore, baseline);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('clamped_drift');
    expect(result.finalScore).toBe(baseline - FIREWALL_MAX_DRIFT); // 45
  });

  it('accepts a score exactly at the drift boundary', () => {
    const result = validateGeminiScore(50 + FIREWALL_MAX_DRIFT, 50);
    expect(result.passed).toBe(true);
    expect(result.reason).toBe('accepted');
  });
});

describe('computeFirewallMetrics', () => {
  it('returns full acceptance for an empty array', () => {
    const metrics = computeFirewallMetrics([]);
    expect(metrics.acceptanceRate).toBe(1);
    expect(metrics.avgDrift).toBe(0);
  });

  it('computes acceptance rate correctly', () => {
    const results = [
      validateGeminiScore(55, 50),  // accepted
      validateGeminiScore(55, 50),  // accepted
      validateGeminiScore('x', 50), // invalid_type
    ];
    const metrics = computeFirewallMetrics(results);
    expect(metrics.acceptanceRate).toBeCloseTo(2 / 3, 5);
    expect(metrics.rejectionsByReason.invalid_type).toBe(1);
    expect(metrics.rejectionsByReason.accepted).toBe(2);
  });

  it('counts clamped_drift rejections', () => {
    const results = [
      validateGeminiScore(10, 80), // drift = 70 → clamped
    ];
    const metrics = computeFirewallMetrics(results);
    expect(metrics.acceptanceRate).toBe(0);
    expect(metrics.rejectionsByReason.clamped_drift).toBe(1);
  });
});
