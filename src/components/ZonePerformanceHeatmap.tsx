import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Zone } from '@/hooks/useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { getTripHours } from '@/lib/tripAnalytics';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { useMemo, useState } from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = [
  { value: '1', label: 'Lun' },
  { value: '2', label: 'Mar' },
  { value: '3', label: 'Mer' },
  { value: '4', label: 'Jeu' },
  { value: '5', label: 'Ven' },
  { value: '6', label: 'Sam' },
  { value: '0', label: 'Dim' },
];

function useZonePerformance() {
  return useQuery({
    queryKey: ['zone-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('zone_id, earnings, tips, started_at, ended_at')
        .not('zone_id', 'is', null)
        .order('started_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });
}

interface Props {
  zones: Zone[];
}

type HeatmapColor = 'green' | 'yellow' | 'red' | 'grey';
type ZonePerformanceTrip = {
  zone_id: string | null;
  earnings: number | null;
  tips: number | null;
  started_at: string;
  ended_at: string | null;
};

const colorLabels: Record<HeatmapColor, string> = {
  green: 'Au-dessus',
  yellow: 'Moyen',
  red: 'En-dessous',
  grey: 'Pas de données',
};

const colorClasses: Record<HeatmapColor, string> = {
  green: 'bg-green-500/20 border-green-500/40 text-green-400',
  yellow: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
  red: 'bg-red-500/20 border-red-500/40 text-red-400',
  grey: 'bg-muted/20 border-border text-muted-foreground',
};

function getMatchingTrips({
  trips,
  selectedHour,
  selectedDay,
}: {
  trips: ZonePerformanceTrip[];
  selectedHour: number;
  selectedDay: number;
}) {
  return trips.filter((trip) => {
    const date = new Date(trip.started_at);
    return date.getHours() === selectedHour && date.getDay() === selectedDay;
  });
}

function buildZoneEarningsPerHour(trips: ZonePerformanceTrip[]) {
  const zoneStats: Record<string, { totalEarnings: number; totalHours: number }> = {};

  for (const trip of trips) {
    if (!trip.zone_id) {
      continue;
    }

    if (!zoneStats[trip.zone_id]) {
      zoneStats[trip.zone_id] = { totalEarnings: 0, totalHours: 0 };
    }

    zoneStats[trip.zone_id].totalEarnings +=
      Number(trip.earnings || 0) + Number(trip.tips || 0);
    zoneStats[trip.zone_id].totalHours += getTripHours(trip);
  }

  const earningsPerHour: Record<string, number> = {};
  for (const [zoneId, stats] of Object.entries(zoneStats)) {
    earningsPerHour[zoneId] =
      stats.totalHours > 0 ? stats.totalEarnings / stats.totalHours : 0;
  }

  return earningsPerHour;
}

function buildZoneColors({
  trips,
  hour,
  day,
  zones,
}: {
  trips: ZonePerformanceTrip[];
  hour: string;
  day: string;
  zones: Zone[];
}) {
  const selectedHour = parseInt(hour, 10);
  const selectedDay = parseInt(day, 10);
  const matchingTrips = getMatchingTrips({ trips, selectedHour, selectedDay });
  const earningsPerHour = buildZoneEarningsPerHour(matchingTrips);
  const values = Object.values(earningsPerHour);

  if (values.length === 0) {
    return new Map<string, HeatmapColor>();
  }

  const average = values.reduce((first, second) => first + second, 0) / values.length;
  const result = new Map<string, HeatmapColor>();

  for (const zone of zones) {
    const eph = earningsPerHour[zone.id];
    if (eph === undefined) {
      result.set(zone.id, 'grey');
      continue;
    }

    if (eph >= average * 1.2) {
      result.set(zone.id, 'green');
      continue;
    }

    if (eph >= average * 0.8) {
      result.set(zone.id, 'yellow');
      continue;
    }

    result.set(zone.id, 'red');
  }

  return result;
}

function HeatmapLegend() {
  return (
    <div className="flex gap-2 text-[11px]">
      {(['green', 'yellow', 'red', 'grey'] as const).map((color) => (
        <span
          key={color}
          className={`px-2 py-0.5 rounded border ${colorClasses[color]}`}
        >
          {colorLabels[color]}
        </span>
      ))}
    </div>
  );
}

function HeatmapZoneList({
  zones,
  zoneColors,
}: {
  zones: Zone[];
  zoneColors: Map<string, HeatmapColor>;
}) {
  return (
    <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
      {zones.map((zone) => {
        const color = zoneColors.get(zone.id) || 'grey';
        return (
          <div
            key={zone.id}
            className={`rounded-lg border px-3 py-2 ${colorClasses[color]}`}
          >
            <span className="text-[13px] font-display font-semibold">
              {zone.name}
            </span>
            <span className="text-[11px] ml-2 capitalize opacity-70">
              {zone.type}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ZonePerformanceHeatmap({ zones }: Props) {
  const [hour, setHour] = useState(String(new Date().getHours()));
  const [day, setDay] = useState(String(new Date().getDay()));
  const { data: trips = [] } = useZonePerformance();

  const zoneColors = useMemo(
    () => buildZoneColors({ trips, hour, day, zones }),
    [trips, hour, day, zones]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        <span className="text-[14px] font-display font-bold">
          Performance par zone
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select value={hour} onValueChange={setHour}>
          <SelectTrigger className="bg-background border-border text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border max-h-60">
            {HOURS.map((h) => (
              <SelectItem key={h} value={String(h)}>
                {String(h).padStart(2, '0')}:00
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger className="bg-background border-border text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {DAYS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <HeatmapLegend />
      <HeatmapZoneList zones={zones} zoneColors={zoneColors} />
    </div>
  );
}
