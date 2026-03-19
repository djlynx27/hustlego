---
name: financial-analyzer
description: Analyse des revenus, marges, coûts et rentabilité pour travailleurs autonomes et chauffeurs gig. Utilise ce skill dès que l'utilisateur veut analyser ses revenus, calculer sa rentabilité par plateforme, estimer ses revenus nets, comparer ses performances entre périodes, ou préparer un rapport financier pour son activité gig (Lyft, DoorDash, SkipTheDishes, taxi).
---

# Financial Analyzer — Gig Economy

Analyse financière complète pour chauffeurs multi-plateforme.

## Métriques clés à calculer

```
Revenu brut       = Total des paiements reçus (avant commissions)
Commissions       = % prélevé par la plateforme
Revenu net plat.  = Brut - Commissions
Coût véhicule     = Essence + Usure (dépréciation + entretien / km pro)
Revenu net réel   = Revenu net plateforme - Coût véhicule - Taxes autonome
Taux horaire net  = Revenu net réel / Heures travaillées
```

## Taux de commission par plateforme (approximatifs 2024–2025)

| Plateforme | Commission | Notes |
|---|---|---|
| Lyft | 20–25% | Variable selon marché |
| DoorDash | 15–30% | Selon contrat restaurant |
| SkipTheDishes | 20–30% | — |
| Uber | 20–27% | — |
| Hypra Pro S | Variable | Taxi privé — vérifier contrat |

## Coût d'usure véhicule (2024)

```python
# Méthode CRA simplifiée (Québec/Canada)
COUT_PAR_KM = {
    "petite_voiture": 0.52,    # Honda Civic, Toyota Corolla
    "vus_compact":    0.63,    # Hyundai Santa Fe Sport (2018)
    "vus_grand":      0.72,    # Highlander, Pilot
    "minivan":        0.68,
}

# Calcul complet
cout_reel_km = (
    (essence_annuelle / km_pro) +
    (entretien_annuel / km_total) +
    (depreciation_annuelle / km_total) +
    (assurance_annuelle * ratio_pro / km_pro)
)
```

## Template d'analyse mensuelle

```python
def analyse_mois(data: dict) -> dict:
    # Inputs
    revenus = data['revenus_plateforme']       # par plateforme
    heures = data['heures_travaillees']
    km_pro = data['km_professionnels']
    km_total = data['km_totaux']
    essence = data['cout_essence']
    
    # Calculs
    ratio_pro = km_pro / km_total
    cout_vehicule = km_pro * COUT_PAR_KM['vus_compact']
    revenu_brut = sum(revenus.values())
    revenu_net = revenu_brut - cout_vehicule - (essence * ratio_pro)
    taux_horaire = revenu_net / heures
    
    return {
        'revenu_brut': revenu_brut,
        'cout_vehicule_pro': cout_vehicule,
        'revenu_net_avant_impot': revenu_net,
        'taux_horaire_net': taux_horaire,
        'km_pro': km_pro,
        'cout_par_km_pro': cout_vehicule / km_pro,
    }
```

## Analyse par plateforme

| Métrique | Lyft | DoorDash | Skip | Total |
|---|---|---|---|---|
| Revenus bruts | — | — | — | — |
| Commissions estimées | — | — | — | — |
| Revenus nets plateforme | — | — | — | — |
| Heures actives | — | — | — | — |
| **Taux horaire net** | — | — | — | — |

## Estimation impôt travailleur autonome (Québec)

```python
# Approximation — consulter un comptable
def estimation_impot(revenu_net_annuel):
    # Cotisations obligatoires
    rpc_rqap = revenu_net_annuel * 0.0604   # RPC (max ~3 867$) + RQAP
    assurance_emploi = 0                    # Travailleurs autonomes = optionnel
    
    # Impôt fédéral (taux marginal simplifié)
    if revenu_net_annuel < 55867:
        impot_federal = revenu_net_annuel * 0.205
    elif revenu_net_annuel < 111733:
        impot_federal = 55867 * 0.205 + (revenu_net_annuel - 55867) * 0.26
    
    # Impôt Québec (simplifié)
    impot_quebec = revenu_net_annuel * 0.20  # Approximation 20–25%
    
    total = rpc_rqap + impot_federal + impot_quebec
    return total, total / revenu_net_annuel  # montant, taux effectif

# Exemple
impot, taux = estimation_impot(45000)
# ≈ 14 500$, taux effectif ≈ 32%
```

## Dashboard de performance recommandé

```
RÉSUMÉ [MOIS]
────────────────────────────────
Revenus bruts totaux    : X XXX.XX$
Coûts véhicule (pro)   :  -XXX.XX$
Autres dépenses pro    :  -XXX.XX$
────────────────────────────────
Revenu net avant impôt : X XXX.XX$
Provision impôt (~30%) :  -XXX.XX$
────────────────────────────────
REVENU NET RÉEL        :   XXX.XX$

Heures travaillées     :  XX h
Taux horaire net       :  XX.XX$/h
Km professionnels      :  X XXX km
Coût/km               :   X.XX$/km
```

## Seuils de rentabilité recommandés

```
🟢 Excellent   : > 25$/h net
🟡 Acceptable  : 18–25$/h net
🔴 À revoir    : < 18$/h net (envisager changer de zone/horaire)
```
