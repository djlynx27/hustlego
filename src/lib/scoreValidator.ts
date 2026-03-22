/**
 * Hallucination Firewall — Neuro-Symbolic validation layer for Gemini scores.
 *
 * Validates LLM score outputs against formal symbolic constraints to prevent
 * AI hallucination from corrupting zone scores displayed to the driver.
 *
 * Design: inspired by the NeSy (Neuro-Symbolic AI) firewall pattern.
 * A score must pass all constraints to be accepted as-is;
 * failing scores are clamped to the safe range instead of being rejected outright.
 *
 * WHY MAX_DRIFT = 35: A 35-point swing on a 0–100 scale is already a significant
 * context-driven adjustment. Beyond that, Gemini is likely hallucinating or
 * misinterpreting zone context. The clamp preserves the direction of the
 * AI's intent while bounding the magnitude of its influence.
 */

export const FIREWALL_MAX_DRIFT = 35; // max allowed deviation from computed baseline
export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

export type ValidationReason =
  | 'accepted'
  | 'clamped_drift'
  | 'invalid_type'
  | 'out_of_range';

export interface ScoreValidationResult {
  /** True only if the score passed all constraints without modification. */
  passed: boolean;
  /** The score to use — may be clamped to the safe range. */
  finalScore: number;
  /** Absolute difference between Gemini score and computed baseline. */
  driftFromBaseline: number;
  reason: ValidationReason;
}

export interface FirewallMetrics {
  acceptanceRate: number;
  avgDrift: number;
  rejectionsByReason: Record<ValidationReason, number>;
}

/**
 * Validates a single score from Gemini against symbolic constraints.
 * Safe to call with any `unknown` input from a parsed API response.
 */
export function validateGeminiScore(
  geminiScore: unknown,
  baselineScore: number
): ScoreValidationResult {
  // Constraint 1: Must be a finite number
  if (typeof geminiScore !== 'number' || !isFinite(geminiScore)) {
    return {
      passed: false,
      finalScore: baselineScore,
      driftFromBaseline: 0,
      reason: 'invalid_type',
    };
  }

  // Constraint 2: Must be within the valid score range [0, 100]
  if (geminiScore < SCORE_MIN || geminiScore > SCORE_MAX) {
    const clamped = Math.min(SCORE_MAX, Math.max(SCORE_MIN, geminiScore));
    return {
      passed: false,
      finalScore: clamped,
      driftFromBaseline: Math.abs(geminiScore - baselineScore),
      reason: 'out_of_range',
    };
  }

  // Constraint 3: Drift from baseline must not exceed MAX_DRIFT
  const drift = Math.abs(geminiScore - baselineScore);
  if (drift > FIREWALL_MAX_DRIFT) {
    // Accept the direction of adjustment but cap the magnitude
    const cappedScore =
      geminiScore > baselineScore
        ? Math.min(geminiScore, baselineScore + FIREWALL_MAX_DRIFT)
        : Math.max(geminiScore, baselineScore - FIREWALL_MAX_DRIFT);
    return {
      passed: false,
      finalScore: cappedScore,
      driftFromBaseline: drift,
      reason: 'clamped_drift',
    };
  }

  return {
    passed: true,
    finalScore: geminiScore,
    driftFromBaseline: drift,
    reason: 'accepted',
  };
}

/**
 * Aggregates a batch of validation results into observability metrics.
 */
export function computeFirewallMetrics(
  results: ScoreValidationResult[]
): FirewallMetrics {
  if (results.length === 0) {
    return {
      acceptanceRate: 1,
      avgDrift: 0,
      rejectionsByReason: {
        accepted: 0,
        clamped_drift: 0,
        invalid_type: 0,
        out_of_range: 0,
      },
    };
  }

  const accepted = results.filter((r) => r.passed).length;
  const avgDrift =
    results.reduce((sum, r) => sum + r.driftFromBaseline, 0) / results.length;

  const rejectionsByReason: Record<ValidationReason, number> = {
    accepted: 0,
    clamped_drift: 0,
    invalid_type: 0,
    out_of_range: 0,
  };
  for (const r of results) {
    rejectionsByReason[r.reason]++;
  }

  return {
    acceptanceRate: accepted / results.length,
    avgDrift,
    rejectionsByReason,
  };
}
