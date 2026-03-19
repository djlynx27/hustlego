---
name: route-optimizer
description: Optimisation de circuits de conduite, séquences de waypoints et stratégies de positionnement pour chauffeurs gig (Lyft, DoorDash, taxi). Utilise ce skill dès que l'utilisateur demande un circuit de conduite, une optimisation de route, une séquence de zones à couvrir, ou une stratégie de positionnement géographique. Couvre Montréal, Laval, Longueuil/Rive-Sud.
---

# Route Optimizer

Optimisation de circuits pour maximiser les revenus par heure sur le territoire Grand Montréal.

## Territoires couverts

- **Montréal** — Centre-ville, Plateau, Mile-End, NDG, Rosemont, HoMa, Hochelaga
- **Laval** — Chomedey, Laval-des-Rapides, Vimont, Sainte-Dorothée
- **Longueuil / Rive-Sud** — Vieux-Longueuil, Brossard, Saint-Lambert, Greenfield Park

## Principes d'optimisation

### Variables clés

```
Revenu/h = f(demande, temps_attente, distance_entre_courses, surcharge)

Maximiser :
  - Taux d'acceptation de courses (rester dans zones à forte demande)
  - Nombre de courses/h (minimiser temps mort)
  - Valeur par course (viser sorties de bars, aéroport, hôtels)

Minimiser :
  - Km à vide entre courses
  - Temps dans zones à faible demande
  - Consommation essence (autoroute vs urbain selon contexte)
```

### Règle autoroute vs urbain

```
Temps disponible > 8 min → Autoroute acceptable
Temps disponible < 8 min → Rester en zone urbaine
Heure de pointe → Urbain prioritaire (trafic autoroute dense)
Nuit (23h–4h) → Autoroute OK (voies dégagées)
```

## Structure d'un circuit 24h

Format recommandé : 96 créneaux de 15 minutes

```
Créneau | Heure  | Zone cible          | Raison
--------|--------|---------------------|----------------------------------
01      | 00:00  | Centre-ville MTL    | Sorties bars/clubs
02      | 00:15  | Sainte-Catherine    | Forte demande nocturne
...
20      | 04:45  | YUL Aéroport        | Premiers vols 5h–6h
21      | 05:00  | YUL → Centre-ville  | Navetteurs matinaux
...
```

## Zones prioritaires par tranche horaire

### Montréal

| Heure | Zones prioritaires | Raison |
|-------|-------------------|--------|
| 00h–03h | Sainte-Catherine, Crescent, Peel | Bars/clubs |
| 03h–06h | YUL Aéroport | Vols tôt + employés |
| 06h–09h | Gare Centrale, Peel, McGill | Navetteurs |
| 09h–11h | Plateau, Mile-End, Outremont | Brunchs |
| 11h–14h | Centre-ville, Vieux-Montréal | Affaires + touristes |
| 14h–17h | Hôpitaux (CHUM, RVH, JGH) | Rendez-vous médicaux |
| 17h–19h | Gare Centrale, métros Berri/McGill | Heure de pointe retour |
| 19h–22h | Restaurants (Plateau, NDG, Hochelaga) | Sorties dîner |
| 22h–00h | Bars (Sainte-Catherine, Bernard, Laurier) | Début soirée |

### Laval

| Heure | Zones | Raison |
|-------|-------|--------|
| 06h–09h | Métro Montmorency, Laval-des-Rapides | Navetteurs MTL |
| 10h–16h | Carrefour Laval, Centropolis | Magasinage |
| 17h–19h | Métro Montmorency | Retour navetteurs |
| 22h–02h | Resto-bars Chomedey | Sorties |

### Longueuil / Rive-Sud

| Heure | Zones | Raison |
|-------|-------|--------|
| 06h–09h | Métro Longueuil, Terminus Longueuil | Navetteurs |
| 11h–14h | Promenades St-Bruno, Quartier Dix30 | Magasinage/resto |
| 17h–19h | Métro Longueuil, Brossard | Retour |

## Événements générateurs de surcharge

Toujours vérifier avant le shift :
- **Concerts** : Centre Bell, Videotron (Québec), Place Bell (Laval)
- **Matchs** : Canadiens (Bell Centre), CF Montréal (Saputo)
- **Festivals** : JAZZFEST, Osheaga, Francofolies, MUTEK
- **Congrès** : Palais des congrès, Hyatt, Marriott Centre-ville
- **Vols** : Vérifier horaires YUL (Flights Board)

## Calcul rentabilité circuit

```python
def roi_zone(courses_h, revenu_moyen, essence_l_100, km_h, prix_essence):
    revenu_brut = courses_h * revenu_moyen
    cout_essence = (km_h / 100) * essence_l_100 * prix_essence
    return revenu_brut - cout_essence

# Exemple : Centre-ville vendredi soir
roi = roi_zone(
    courses_h=3.5,
    revenu_moyen=14.50,
    essence_l_100=9.5,
    km_h=22,
    prix_essence=1.75
)
# = 50.75$ - 3.65$ = 47.10$/h net essence
```

## Output recommandé

Pour chaque circuit généré, livrer :
1. Tableau 96 créneaux (HTML avec couleurs demand-level)
2. Revenus estimés par tranche horaire
3. Liens Google Maps par waypoint
4. Alertes événements spéciaux (si API Ticketmaster dispo)
