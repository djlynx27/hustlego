import type { ScoreFactors } from '@/hooks/useDemandScores';
import { CalendarCheck, CloudRain, Sparkles } from 'lucide-react';

interface ScoreFactorIconsProps {
  factors: ScoreFactors | undefined;
}

function WeatherBoostIcon({
  weatherBoostPoints,
}: {
  weatherBoostPoints: number;
}) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-primary"
      title={`Météo +${weatherBoostPoints}`}
    >
      <CloudRain className="w-3.5 h-3.5" />
      {weatherBoostPoints > 0 ? (
        <span className="text-[11px] font-body font-semibold">
          +{weatherBoostPoints}
        </span>
      ) : null}
    </span>
  );
}

function EventBoostIcon({ eventBoostPoints }: { eventBoostPoints: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-accent-foreground"
      title={`Événement +${eventBoostPoints}`}
    >
      <CalendarCheck className="w-3.5 h-3.5" />
      {eventBoostPoints > 0 ? (
        <span className="text-[11px] font-body font-semibold">
          +{eventBoostPoints}
        </span>
      ) : null}
    </span>
  );
}

function LearningBoostIcon({
  learningBoostPoints,
  learningSimilarity,
  learningAvgEarningsPerHour,
}: {
  learningBoostPoints: number;
  learningSimilarity: number | null | undefined;
  learningAvgEarningsPerHour: number | null | undefined;
}) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-primary"
      title={`IA contextuelle +${learningBoostPoints} (${Math.round((learningSimilarity ?? 0) * 100)}%, ~${Math.round(learningAvgEarningsPerHour ?? 0)}$/h)`}
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span className="text-[11px] font-body font-semibold">
        +{learningBoostPoints}
      </span>
    </span>
  );
}

/**
 * Small inline icons showing which factors boosted the demand score.
 */
export function ScoreFactorIcons({ factors }: ScoreFactorIconsProps) {
  if (!factors) return null;
  const {
    hasWeatherBoost,
    hasEventBoost,
    weatherBoostPoints,
    eventBoostPoints,
    learningBoostPoints,
    learningSimilarity,
    learningAvgEarningsPerHour,
  } = factors;
  const hasLearningBoost = Number(learningBoostPoints ?? 0) > 0;

  if (!hasWeatherBoost && !hasEventBoost && !hasLearningBoost) return null;

  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {hasWeatherBoost ? (
        <WeatherBoostIcon weatherBoostPoints={weatherBoostPoints} />
      ) : null}
      {hasEventBoost ? (
        <EventBoostIcon eventBoostPoints={eventBoostPoints} />
      ) : null}
      {hasLearningBoost ? (
        <LearningBoostIcon
          learningBoostPoints={Number(learningBoostPoints ?? 0)}
          learningSimilarity={learningSimilarity}
          learningAvgEarningsPerHour={learningAvgEarningsPerHour}
        />
      ) : null}
    </span>
  );
}
