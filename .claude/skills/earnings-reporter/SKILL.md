---
name: earnings-reporter
description: Generation de rapports de revenus consolides pour chauffeurs multi-plateforme (Lyft, DoorDash, SkipTheDishes, Hypra, Uber). Utilise ce skill des que l'utilisateur veut un resume de gains, un rapport hebdomadaire ou mensuel, une consolidation de revenus multi-plateformes, ou un bilan de performance de son activite gig.
---

# Earnings Reporter

Rapports de revenus consolides pour chauffeurs multi-plateforme.

## Structure du rapport standard

```
RAPPORT DE REVENUS [Periode]
Genere le: [Date]
=======================================

RESUME EXECUTIF
---------------
Revenu brut total     : X XXX.XX $
Deductions vehicule   :  -XXX.XX $
Revenu net estime     : X XXX.XX $
Heures travaillees    :    XX.X h
Taux horaire moyen    :   XX.XX $/h
Courses/livraisons    :     XXX
Km professionnels     :   X XXX km

PAR PLATEFORME
--------------
Plateforme    Brut       Courses  Taux/h   % Total
Lyft          XXX.XX $      XX   XX.XX $    XX%
DoorDash      XXX.XX $      XX   XX.XX $    XX%
Skip          XXX.XX $      XX   XX.XX $    XX%
Hypra Pro S   XXX.XX $      XX   XX.XX $    XX%

PAR JOUR
--------
Vendredi  : XXX.XX $ ** Meilleure journee
Samedi    : XXX.XX $
Dimanche  : XXX.XX $
Lundi     : XXX.XX $
Mardi     : XXX.XX $
Mercredi  : XXX.XX $
Jeudi     : XXX.XX $

TOP CRENEAUX
------------
1. Vendredi 22h-02h   XX.XX $/h
2. Samedi  18h-22h    XX.XX $/h
3. Rush mat. 7h-9h    XX.XX $/h

CARBURANT ET COUTS
------------------
Km totaux          : X XXX km
Km pro (XX%)       : X XXX km
Essence estimee    :   XXX L
Cout carburant     :   XXX.XX $
Cout au km pro     :     X.XX $/km
```

## Generateur Python

```python
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict

@dataclass
class Shift:
    platform: str
    date: datetime
    hours: float
    earnings: float
    trips: int
    km_pro: float
    km_total: float

def generate_report(shifts: List[Shift], period: str) -> str:
    platforms: Dict[str, dict] = {}
    days: Dict[int, float] = {i: 0 for i in range(7)}
    totals = {'earnings': 0, 'hours': 0, 'trips': 0, 'km_pro': 0, 'km_total': 0}

    for s in shifts:
        if s.platform not in platforms:
            platforms[s.platform] = {'earnings': 0, 'hours': 0, 'trips': 0}
        platforms[s.platform]['earnings'] += s.earnings
        platforms[s.platform]['hours'] += s.hours
        platforms[s.platform]['trips'] += s.trips
        days[s.date.weekday()] += s.earnings
        totals['earnings'] += s.earnings
        totals['hours'] += s.hours
        totals['trips'] += s.trips
        totals['km_pro'] += s.km_pro
        totals['km_total'] += s.km_total

    taux_horaire = totals['earnings'] / totals['hours'] if totals['hours'] > 0 else 0
    ratio_pro = totals['km_pro'] / totals['km_total'] if totals['km_total'] > 0 else 0

    lines = [
        f"RAPPORT DE REVENUS -- {period}",
        f"Genere le: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "=" * 45,
        "",
        "RESUME EXECUTIF",
        "-" * 20,
        f"Revenu brut total     : {totals['earnings']:>10.2f} $",
        f"Heures travaillees    : {totals['hours']:>10.1f} h",
        f"Taux horaire moyen    : {taux_horaire:>10.2f} $/h",
        f"Courses/livraisons    : {totals['trips']:>10}",
        f"Km professionnels     : {totals['km_pro']:>10.0f} km",
        "",
        "PAR PLATEFORME",
        "-" * 20,
        f"{'Plateforme':<14} {'Brut':>10} {'Courses':>8} {'Taux/h':>8} {'%':>6}",
    ]

    for plat, d in sorted(platforms.items(), key=lambda x: -x[1]['earnings']):
        pct = d['earnings'] / totals['earnings'] * 100
        rate = d['earnings'] / d['hours'] if d['hours'] > 0 else 0
        lines.append(f"{plat:<14} {d['earnings']:>8.2f} $ {d['trips']:>7} {rate:>7.2f} $ {pct:>5.1f}%")

    day_names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    best_day = max(days, key=days.get)
    lines += ["", "PAR JOUR", "-" * 20]
    for i, name in enumerate(day_names):
        marker = " ** Meilleure journee" if i == best_day else ""
        lines.append(f"{name} : {days[i]:>8.2f} ${marker}")

    return "\n".join(lines)
```

## Export Excel (openpyxl)

```python
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, numbers

def export_excel(shifts: List[Shift], filepath: str):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Revenus"

    headers = ["Date", "Plateforme", "Heures", "Revenus", "Courses", "Km Pro", "Taux/h"]
    header_style = PatternFill(fgColor="1a1a2e", fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True)

    for col, h in enumerate(headers, 1):
        cell = ws.cell(1, col, h)
        cell.fill = header_style
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center')

    for row, s in enumerate(shifts, 2):
        rate = s.earnings / s.hours if s.hours > 0 else 0
        ws.append([s.date.strftime('%Y-%m-%d'), s.platform, s.hours,
                   s.earnings, s.trips, s.km_pro, rate])
        ws.cell(row, 4).number_format = '#,##0.00 $'
        ws.cell(row, 7).number_format = '#,##0.00 $'

    wb.save(filepath)
```

## Seuils de performance

```
Taux horaire net (apres essence)
>= 30 $/h  Excellent
20-29 $/h  Correct
15-19 $/h  Acceptable -- ajuster horaires
< 15 $/h   Changer de zone ou creneau
```
