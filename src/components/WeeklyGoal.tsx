import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { getWeekRange } from '@/lib/weeklyGoal';
import { useQuery } from '@tanstack/react-query';
import { Target } from 'lucide-react';
import { useEffect, useState } from 'react';

const LS_KEY = 'geohustle_weekly_goal';
const WEEKLY_GOAL_EVENT = 'geohustle:weekly-goal-updated';

function parseWeeklyGoal(value: string | null): number {
  const parsed = Number(value?.trim() ?? '');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function readWeeklyGoal(): number {
  return parseWeeklyGoal(localStorage.getItem(LS_KEY));
}

function writeWeeklyGoal(value: string) {
  const parsedGoal = parseWeeklyGoal(value);

  if (parsedGoal > 0) {
    localStorage.setItem(LS_KEY, String(parsedGoal));
  } else {
    localStorage.removeItem(LS_KEY);
  }

  window.dispatchEvent(new CustomEvent(WEEKLY_GOAL_EVENT));
}

function useWeekTripsEarnings() {
  const { from, to } = getWeekRange();
  return useQuery({
    queryKey: ['week-earnings', from],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('earnings, tips')
        .gte('started_at', from)
        .lte('started_at', to);
      if (error) throw error;
      return (data ?? []).reduce(
        (sum, t) => sum + Number(t.earnings || 0) + Number(t.tips || 0),
        0
      );
    },
    staleTime: 60_000,
  });
}

export function WeeklyGoalDisplay() {
  const [goal, setGoal] = useState(() => readWeeklyGoal());
  const { data: weekEarnings = 0 } = useWeekTripsEarnings();
  const { dayOfWeek } = getWeekRange();

  useEffect(() => {
    const syncGoal = () => {
      setGoal(readWeeklyGoal());
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LS_KEY) {
        syncGoal();
      }
    };

    window.addEventListener(WEEKLY_GOAL_EVENT, syncGoal);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(WEEKLY_GOAL_EVENT, syncGoal);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (goal <= 0) return null;

  const pct = Math.min(100, Math.round((weekEarnings / goal) * 100));
  const expectedPct = Math.round((dayOfWeek / 7) * 100);

  let status: { label: string; color: string };
  if (pct >= expectedPct + 5) {
    status = { label: 'En avance', color: 'text-green-400' };
  } else if (pct >= expectedPct - 10) {
    status = { label: 'Dans les temps', color: 'text-yellow-400' };
  } else {
    status = { label: 'En retard', color: 'text-red-400' };
  }

  return (
    <div className="bg-card rounded-xl border border-border px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-[14px] font-body text-muted-foreground">
            Objectif semaine
          </span>
        </div>
        <span className={`text-[14px] font-display font-bold ${status.color}`}>
          {status.label}
        </span>
      </div>
      <Progress value={pct} className="h-2.5" />
      <div className="flex justify-between text-[13px] font-body">
        <span className="text-foreground font-display font-bold">
          ${weekEarnings.toFixed(0)} / ${goal}
        </span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
    </div>
  );
}

export function WeeklyGoalSetting() {
  const [goal, setGoal] = useState(() => {
    const saved = readWeeklyGoal();
    return saved > 0 ? String(saved) : '';
  });

  function save(val: string) {
    setGoal(val);
    writeWeeklyGoal(val);
  }

  return (
    <div className="flex items-center gap-2">
      <Target className="w-4 h-4 text-primary flex-shrink-0" />
      <span className="text-[14px] font-body text-muted-foreground whitespace-nowrap">
        Objectif semaine $
      </span>
      <input
        type="number"
        value={goal}
        onChange={(e) => save(e.target.value)}
        placeholder="ex: 1500"
        className="flex-1 bg-background border border-border rounded-md px-2 py-1.5 text-[14px] font-display"
      />
    </div>
  );
}
