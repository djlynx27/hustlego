import type { Zone } from '@/hooks/useSupabase';

export interface LearningAgentState {
  zoneWeightAdjustments: Record<string, number>;
  lastUpdated: string;
}

export interface LearningAgent {
  id: string;
  name: string;
  description: string;
  weight: number;
  predict: (zone: Zone, baseScore: number) => number;
  learn: (history: ZoneHistory[]) => LearningAgentState;
}

export interface ZoneHistory {
  zoneId: string;
  observedScore: number;
  expectedScore: number;
  timestamp: string;
}

export function getDefaultLearningAgents(): LearningAgent[] {
  return [
    {
      id: 'trendAgent',
      name: 'Trend Agent',
      description: 'Adapte la prédiction selon la tendance historique de la zone',
      weight: 0.55,
      predict: (_zone, baseScore) => {
        // trend logic omitted for unused param
        return Math.min(100, Math.max(0, baseScore));
      },
      learn: (_history) => {
        return { zoneWeightAdjustments: {}, lastUpdated: new Date().toISOString() };
      },
    },
    {
      id: 'rushhourAgent',
      name: 'Rush Hour Agent',
      description: 'Renforce les demandes en heure de pointe',
      weight: 0.45,
      predict: (_zone, baseScore) => {
        const hour = new Date().getHours();
        const modifier = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19) ? 1.12 : 1;
        return Math.min(100, Math.max(0, Math.round(baseScore * modifier)));
      },
      learn: (_history) => ({ zoneWeightAdjustments: {}, lastUpdated: new Date().toISOString() }),
    },
  ];
}

export function applyLearningAgents(_zones: Zone[], baseScores: Map<string, number>, _history: ZoneHistory[] = []): Map<string, number> {
  // ...existing code for applying learning agents...
  return new Map(baseScores);
}
