/**
 * WeightCalibratorPanel
 *
 * Interface admin pour le weight-calibrator Edge Function.
 *
 * Fonctionnalités :
 *   - Affiche les poids courants du modèle (GET weight-calibrator)
 *   - Bouton "Recalibrer maintenant" (POST weight-calibrator)
 *   - Show la précision, MAE, deltas après recalibration
 *   - Historique des 5 dernières calibrations
 *
 * Usage :
 *   <WeightCalibratorPanel />
 */

import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────

interface WeightSnapshot {
  w_time: number;
  w_day: number;
  w_weather: number;
  w_events: number;
  w_historical: number;
  mae: number | null;
  accuracy_pct: number | null;
  trip_count?: number | null;
  source?: string;
  note?: string | null;
  created_at?: string;
}

interface CalibrateResult {
  ok?: boolean;
  new_weights: WeightSnapshot;
  deltas: Record<string, number>;
  mae: number;
  accuracy_pct: number;
  trip_count: number;
  message?: string;
  reason?: string;
  current_weights?: Record<string, number>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const WEIGHT_LABELS: Record<string, { label: string; icon: string }> = {
  w_time: { label: 'Heure du jour', icon: '🕐' },
  w_day: { label: 'Jour semaine', icon: '📅' },
  w_weather: { label: 'Météo', icon: '🌧' },
  w_events: { label: 'Événements', icon: '🎭' },
  w_historical: { label: 'Historique EMA', icon: '📊' },
};

function pctBar(value: number) {
  return `${Math.round(value * 100)}%`;
}

function deltaColor(d: number) {
  if (Math.abs(d) < 0.005) return 'text-muted-foreground';
  return d > 0 ? 'text-emerald-400' : 'text-orange-400';
}

function relativeDate(iso: string) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.round((now - then) / 60000);
  if (diff < 2) return "à l'instant";
  if (diff < 60) return `il y a ${diff} min`;
  const hrs = Math.floor(diff / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  return new Date(iso).toLocaleDateString('fr-CA');
}

async function parseJsonResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestCalibration({
  url,
  token,
  days,
  minTrips,
}: {
  url: string;
  token: string;
  days: number;
  minTrips: number;
}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ days, min_trips: minTrips }),
  });

  return {
    response,
    body: await parseJsonResponse(response),
  };
}

function handleCalibrationHttpError({
  status,
  body,
  minTrips,
}: {
  status: number;
  body: unknown;
  minTrips: number;
}) {
  const errBody = body as { error?: string } | null;
  const message =
    (typeof errBody === 'object' && errBody?.error) || `Erreur HTTP ${status}`;

  if (status === 404) {
    toast.error(
      'Edge Function weight-calibrator non déployée. Lance : supabase functions deploy weight-calibrator'
    );
    return;
  }

  if (
    typeof message === 'string' &&
    message.toLowerCase().includes('not enough')
  ) {
    toast.error(
      `Pas assez de courses (${minTrips} requises). Réduis « Courses min. » ou élargis la fenêtre.`
    );
    return;
  }

  toast.error(typeof message === 'string' ? message : `Erreur HTTP ${status}`);
}

function applyCalibrationResult({
  result,
  setLastResult,
  setCurrentWeights,
}: {
  result: CalibrateResult | null;
  setLastResult: (result: CalibrateResult | null) => void;
  setCurrentWeights: (weights: WeightSnapshot) => void;
}) {
  if (result?.ok === false) {
    toast.error(
      result.reason ??
        'Calibration impossible pour le moment. Réessaie plus tard.'
    );
    return false;
  }

  if (!result?.new_weights) {
    toast.error("Réponse inattendue de l'Edge Function");
    return false;
  }

  setLastResult(result);
  setCurrentWeights(result.new_weights);
  toast.success(
    `Calibration terminée · MAE $${result.mae?.toFixed(1) ?? '?'}/h · ${result.trip_count ?? 0} courses`
  );
  return true;
}

function CurrentWeightsCard({
  currentWeights,
  loading,
  lastResult,
}: {
  currentWeights: WeightSnapshot | null;
  loading: boolean;
  lastResult: CalibrateResult | null;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-display font-bold flex items-center gap-1.5">
            🧠 Poids du modèle
          </h3>
          {currentWeights?.created_at && (
            <p className="text-[11px] text-muted-foreground font-body">
              Mis à jour {relativeDate(currentWeights.created_at)}
              {currentWeights.source
                ? ` · source: ${currentWeights.source}`
                : ''}
            </p>
          )}
        </div>
        {currentWeights && (
          <div className="flex gap-3 text-right">
            <div>
              <span className="text-[16px] font-mono font-bold block">
                {currentWeights.accuracy_pct != null
                  ? `${Math.round(currentWeights.accuracy_pct)}%`
                  : '—'}
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                précision
              </span>
            </div>
            <div>
              <span className="text-[16px] font-mono font-bold block">
                {currentWeights.mae != null
                  ? `$${currentWeights.mae.toFixed(1)}`
                  : '—'}
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                MAE/h
              </span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-[13px] text-muted-foreground font-body text-center py-3 animate-pulse">
          Chargement…
        </p>
      ) : currentWeights ? (
        <div className="space-y-2">
          {(
            Object.keys(WEIGHT_LABELS) as Array<keyof typeof WEIGHT_LABELS>
          ).map((key) => {
            const value = currentWeights[key as keyof WeightSnapshot] as number;
            const delta = lastResult?.deltas?.[key] ?? 0;
            const meta = WEIGHT_LABELS[key]!;

            return (
              <div key={key} className="space-y-0.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-body text-muted-foreground">
                    {meta.icon} {meta.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {Math.abs(delta) >= 0.005 && (
                      <span
                        className={cn(
                          'text-[10px] font-mono',
                          deltaColor(delta)
                        )}
                      >
                        {delta > 0 ? '+' : ''}
                        {(delta * 100).toFixed(1)}%
                      </span>
                    )}
                    <span className="font-mono font-semibold">
                      {pctBar(value)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full transition-all duration-700"
                    style={{ width: pctBar(value) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[13px] text-orange-400 font-body text-center py-2">
          Poids non disponibles — weight-calibrator Edge Function non déployée ?
        </p>
      )}
    </div>
  );
}

function RecalibrationControls({
  days,
  minTrips,
  calibrating,
  lastResult,
  onDaysChange,
  onMinTripsChange,
  onCalibrate,
}: {
  days: number;
  minTrips: number;
  calibrating: boolean;
  lastResult: CalibrateResult | null;
  onDaysChange: (value: number) => void;
  onMinTripsChange: (value: number) => void;
  onCalibrate: () => void;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <h3 className="text-[14px] font-display font-bold">⚙️ Recalibration</h3>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[11px] text-muted-foreground font-body block mb-1">
            Fenêtre (jours)
          </label>
          <input
            type="number"
            value={days}
            min={3}
            max={90}
            onChange={(event) => onDaysChange(Number(event.target.value))}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[14px] font-mono outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex-1">
          <label className="text-[11px] text-muted-foreground font-body block mb-1">
            Courses min.
          </label>
          <input
            type="number"
            value={minTrips}
            min={3}
            max={200}
            onChange={(event) => onMinTripsChange(Number(event.target.value))}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[14px] font-mono outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <button
        onClick={onCalibrate}
        disabled={calibrating}
        className={cn(
          'w-full h-11 rounded-xl font-display font-bold text-[14px] transition-all',
          calibrating
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'
        )}
      >
        {calibrating ? '⟳ Calibration en cours…' : '🔄 Recalibrer maintenant'}
      </button>

      {lastResult && (
        <div className="bg-muted/40 rounded-lg border border-border/50 p-3 text-[12px] font-body space-y-1">
          <p className="font-bold text-foreground">
            Résultat dernière calibration
          </p>
          <p className="text-muted-foreground">
            {lastResult.trip_count} courses · MAE ${lastResult.mae.toFixed(2)}/h
            · précision {Math.round(lastResult.accuracy_pct)}%
          </p>
          {lastResult.message && (
            <p className="text-orange-400">{lastResult.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

function CalibrationHistory({ history }: { history: WeightSnapshot[] }) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-2">
      <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wide">
        Historique calibrations
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] font-body border-collapse">
          <thead>
            <tr className="text-muted-foreground border-b border-border/50">
              <th className="text-left py-1 pr-3 font-medium">Date</th>
              <th className="text-right py-1 pr-3 font-medium">MAE</th>
              <th className="text-right py-1 pr-3 font-medium">Précision</th>
              <th className="text-right py-1 pr-3 font-medium">Courses</th>
              <th className="text-left py-1 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr
                key={entry.created_at ?? index}
                className="border-b border-border/30 last:border-0"
              >
                <td className="py-1 pr-3 text-muted-foreground">
                  {entry.created_at ? relativeDate(entry.created_at) : '—'}
                </td>
                <td className="py-1 pr-3 text-right font-mono">
                  {entry.mae !== null ? `$${entry.mae.toFixed(1)}/h` : '—'}
                </td>
                <td className="py-1 pr-3 text-right font-mono">
                  {entry.accuracy_pct !== null
                    ? `${Math.round(entry.accuracy_pct)}%`
                    : '—'}
                </td>
                <td className="py-1 pr-3 text-right font-mono">
                  {entry.trip_count ?? '—'}
                </td>
                <td className="py-1 text-muted-foreground">
                  {entry.source ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface WeightCalibratorPanelProps {
  className?: string;
}

export function WeightCalibratorPanel({
  className,
}: WeightCalibratorPanelProps) {
  const [currentWeights, setCurrentWeights] = useState<WeightSnapshot | null>(
    null
  );
  const [history, setHistory] = useState<WeightSnapshot[]>([]);
  const [lastResult, setLastResult] = useState<CalibrateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [calibrating, setCalibrating] = useState(false);
  const [days, setDays] = useState(14);
  const [minTrips, setMinTrips] = useState(10);

  const getEFUrl = useCallback(() => {
    const projectRef =
      (
        import.meta as unknown as { env: Record<string, string> }
      ).env.VITE_SUPABASE_URL?.replace('https://', '').split('.')[0] ?? '';
    return `https://${projectRef}.supabase.co/functions/v1/weight-calibrator`;
  }, []);

  const getAuthToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? '';
  }, []);

  // ── Fetch current weights ────────────────────────────────────────────────────

  const fetchWeights = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(getEFUrl(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as WeightSnapshot & {
        history?: WeightSnapshot[];
      };
      setCurrentWeights(data);
      if (data.history) setHistory(data.history.slice(0, 5));
    } catch (err) {
      console.error('[WeightCalibratorPanel] fetch', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, getEFUrl]);

  useEffect(() => {
    void fetchWeights();
  }, [fetchWeights]);

  // ── Trigger recalibration ────────────────────────────────────────────────────

  const handleCalibrate = useCallback(async () => {
    setCalibrating(true);
    try {
      const token = await getAuthToken();
      const { response, body } = await requestCalibration({
        url: getEFUrl(),
        token,
        days,
        minTrips,
      });

      if (!response.ok) {
        handleCalibrationHttpError({
          status: response.status,
          body,
          minTrips,
        });
        return;
      }

      const result = body as CalibrateResult | null;
      if (
        applyCalibrationResult({
          result,
          setLastResult,
          setCurrentWeights,
        })
      ) {
        void fetchWeights();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(`Erreur lors de la calibration : ${msg}`);
      console.error('[WeightCalibratorPanel] calibrate', err);
    } finally {
      setCalibrating(false);
    }
  }, [getAuthToken, getEFUrl, days, minTrips, fetchWeights]);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className={cn('space-y-3', className)}>
      <CurrentWeightsCard
        currentWeights={currentWeights}
        loading={loading}
        lastResult={lastResult}
      />
      <RecalibrationControls
        days={days}
        minTrips={minTrips}
        calibrating={calibrating}
        lastResult={lastResult}
        onDaysChange={setDays}
        onMinTripsChange={setMinTrips}
        onCalibrate={() => {
          void handleCalibrate();
        }}
      />
      <CalibrationHistory history={history} />
    </div>
  );
}
