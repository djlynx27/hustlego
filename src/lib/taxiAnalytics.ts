type TaxiEntryLike = {
  amount: number;
  km: number;
  duration_min: number | null | undefined;
};

function toFiniteNumber(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

export function summarizeTaxiEntries(entries: TaxiEntryLike[]) {
  const totals = entries.reduce(
    (acc, entry) => {
      acc.amount += toFiniteNumber(entry.amount);
      acc.km += toFiniteNumber(entry.km);

      const durationMin = toFiniteNumber(entry.duration_min);
      if (durationMin > 0) {
        acc.durationMin += durationMin;
      }

      return acc;
    },
    {
      amount: 0,
      km: 0,
      durationMin: 0,
    }
  );

  return {
    amount: totals.amount,
    km: totals.km,
    durationMin: totals.durationMin,
    perKm: totals.km > 0 ? totals.amount / totals.km : 0,
    perHour:
      totals.durationMin > 0 ? (totals.amount / totals.durationMin) * 60 : 0,
    entries: entries.length,
  };
}
