import { Button } from '@/components/ui/button';
import {
  type HomeConstraintAlert,
  type HomeConstraintsResult,
} from '@/hooks/useHomeConstraints';
import { launchGoogleMapsNavigation } from '@/lib/venueCoordinates';
import { Home, MapPin, Settings } from 'lucide-react';
import { useState } from 'react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

/**
 * Geocode a free-text address using Mapbox Geocoding API.
 * Returns null if the token is missing or the request fails.
 */
async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  if (!MAPBOX_TOKEN) return null;
  try {
    const encoded = encodeURIComponent(address);
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json` +
      `?access_token=${MAPBOX_TOKEN}&country=CA&proximity=-73.57,45.52&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      features: Array<{ center: [number, number] }>;
    };
    const feat = json.features[0];
    if (!feat) return null;
    return { lat: feat.center[1], lng: feat.center[0] };
  } catch {
    return null;
  }
}

const URGENCY_RING: Record<string, string> = {
  critical: 'border-destructive/60 bg-destructive/15',
  warning: 'border-orange-500/50 bg-orange-500/10',
  info: 'border-blue-500/40 bg-blue-500/8',
};

const URGENCY_TEXT: Record<string, string> = {
  critical: 'text-destructive',
  warning: 'text-orange-400',
  info: 'text-blue-400',
};

interface FamilySchedulePanelProps {
  constraints: HomeConstraintsResult;
  className?: string;
}

/**
 * Toggle + settings + live alert for the family-schedule constraint feature.
 *
 * When enabled the panel:
 *  1. Tracks return-home window (morning, weekdays only).
 *  2. Tracks mom's workplace pickup (afternoon, weekdays only, rush-hour-aware).
 *  3. Shows a live alert banner with a one-tap Maps shortcut.
 *  4. Lets the user update mom's workplace via a Mapbox-geocoded address search.
 */
export function FamilySchedulePanel({
  constraints,
  className = '',
}: FamilySchedulePanelProps) {
  const { settings, updateSettings, alert } = constraints;

  const [showSettings, setShowSettings] = useState(false);
  const [editingWork, setEditingWork] = useState(false);
  const [workName, setWorkName] = useState(settings.momWorkName);
  const [workAddress, setWorkAddress] = useState(settings.momWorkAddress);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const handleToggle = () => {
    updateSettings({ enabled: !settings.enabled });
  };

  const handleOpenEdit = () => {
    setWorkName(settings.momWorkName);
    setWorkAddress(settings.momWorkAddress);
    setGeocodeError(null);
    setEditingWork((prev) => !prev);
  };

  const handleSaveWork = async () => {
    setGeocoding(true);
    setGeocodeError(null);
    const coords = await geocodeAddress(workAddress);
    setGeocoding(false);
    if (coords) {
      updateSettings({
        momWorkName: workName,
        momWorkAddress: workAddress,
        momWorkLat: coords.lat,
        momWorkLng: coords.lng,
      });
      setEditingWork(false);
    } else {
      // Save name + address text even without geocoords — keep existing coords.
      updateSettings({ momWorkName: workName, momWorkAddress: workAddress });
      setGeocodeError(
        MAPBOX_TOKEN
          ? 'Adresse introuvable. Les coordonnées précédentes sont conservées.'
          : 'Mapbox non configuré. Coordonnées inchangées.'
      );
      setEditingWork(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* ── Main toggle button ────────────────────────────────────────── */}
      <button
        onClick={handleToggle}
        className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
          settings.enabled
            ? 'border-purple-500/40 bg-purple-500/10'
            : 'border-border bg-card'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Home className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[14px] font-display font-bold">
                Planning familial
              </p>
              <p className="text-[12px] text-muted-foreground font-body mt-0.5 truncate">
                {settings.enabled
                  ? `Maison à ${settings.returnHomeWindowStart} · Maman à ${settings.pickupTime}`
                  : 'Alertes retour maison + récupération maman'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {settings.enabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings((s) => !s);
                }}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors"
                aria-label="Paramètres du planning familial"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                settings.enabled
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {settings.enabled ? 'ACTIF' : 'OFF'}
            </span>
          </div>
        </div>
      </button>

      {/* ── Settings panel ────────────────────────────────────────────── */}
      {settings.enabled && showSettings && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h4 className="text-[13px] font-display font-bold text-foreground">
            ⚙️ Paramètres du planning familial
          </h4>

          {/* Return home window */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wide">
              Fenêtre de retour à la maison
            </p>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={settings.returnHomeWindowStart}
                onChange={(e) =>
                  updateSettings({ returnHomeWindowStart: e.target.value })
                }
                className="h-9 flex-1 rounded-lg border border-border bg-muted px-2 text-[13px] font-body"
              />
              <span className="text-muted-foreground text-[13px] font-body">
                à
              </span>
              <input
                type="time"
                value={settings.returnHomeWindowEnd}
                onChange={(e) =>
                  updateSettings({ returnHomeWindowEnd: e.target.value })
                }
                className="h-9 flex-1 rounded-lg border border-border bg-muted px-2 text-[13px] font-body"
              />
            </div>
            <p className="text-[11px] text-muted-foreground font-body leading-snug">
              📍 {settings.homeAddress}
            </p>
          </div>

          {/* Afternoon pickup time */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wide">
              Heure de récupération (après-midi)
            </p>
            <input
              type="time"
              value={settings.pickupTime}
              onChange={(e) => updateSettings({ pickupTime: e.target.value })}
              className="h-9 w-full rounded-lg border border-border bg-muted px-2 text-[13px] font-body"
            />
            <p className="text-[11px] text-muted-foreground font-body">
              Le trajet tient compte des heures de pointe (16h–18h30).
            </p>
          </div>

          {/* Mom's workplace */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wide">
                Lieu de travail (maman)
              </p>
              <button
                onClick={handleOpenEdit}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                {editingWork ? 'Annuler' : 'Modifier'}
              </button>
            </div>

            {editingWork ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nom du lieu (ex: École Notre-Dame)"
                  value={workName}
                  onChange={(e) => setWorkName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-muted px-2 text-[13px] font-body"
                />
                <input
                  type="text"
                  placeholder="Adresse complète (ex: 123 rue X, Montréal, QC)"
                  value={workAddress}
                  onChange={(e) => setWorkAddress(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-muted px-2 text-[13px] font-body"
                />
                {geocodeError && (
                  <p className="text-[11px] text-orange-400 font-body">
                    ⚠️ {geocodeError}
                  </p>
                )}
                <Button
                  onClick={() => void handleSaveWork()}
                  disabled={geocoding || !workName.trim()}
                  className="w-full h-9 text-[13px] font-display font-bold"
                >
                  {geocoding
                    ? '🔍 Recherche des coordonnées...'
                    : '✅ Enregistrer'}
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-body font-medium">
                    {settings.momWorkName}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-body">
                    {settings.momWorkAddress}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 font-body mt-0.5">
                    {settings.momWorkLat.toFixed(4)},{' '}
                    {settings.momWorkLng.toFixed(4)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Active alert banner ───────────────────────────────────────── */}
      {settings.enabled && alert && (
        <FamilyConstraintAlertBanner alert={alert} />
      )}
    </div>
  );
}

function FamilyConstraintAlertBanner({
  alert,
}: {
  alert: HomeConstraintAlert;
}) {
  const ring = URGENCY_RING[alert.urgency] ?? URGENCY_RING['info'];
  const txt = URGENCY_TEXT[alert.urgency] ?? URGENCY_TEXT['info'];

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 ${ring}`}
    >
      <span className="text-lg flex-shrink-0 mt-0.5">
        {alert.type === 'return_home' ? '🏠' : '🎒'}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-display font-bold leading-snug ${txt}`}>
          {alert.message}
        </p>
        {alert.minutesUntilDeparture > 0 && (
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">
            Départ recommandé : {alert.recommendedDepartureTime}
          </p>
        )}
      </div>
      <button
        onClick={() =>
          launchGoogleMapsNavigation(
            alert.targetName,
            alert.targetLat,
            alert.targetLng
          )
        }
        className={`flex-shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-bold transition-colors border mt-0.5 ${txt} border-current/30 bg-current/5 hover:bg-current/15 active:scale-95`}
        aria-label={`Naviguer vers ${alert.targetName}`}
      >
        Maps
      </button>
    </div>
  );
}
