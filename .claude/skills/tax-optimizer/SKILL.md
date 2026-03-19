---
name: tax-optimizer
description: Calcul et optimisation des déductions fiscales canadiennes pour travailleurs autonomes et chauffeurs gig (Lyft, DoorDash, Uber, SkipTheDishes, taxi). Utilise ce skill dès que l'utilisateur parle de dépenses déductibles, TPS/TVQ, factures à catégoriser, revenus d'auto-emploi, crédits d'impôt, ou prépare ses impôts canadiens (fédéral + Québec). Taux et règles calibrés pour le Québec et le Canada.
---

# Tax Optimizer — Canada / Québec (Travailleurs Autonomes)

Optimisation fiscale pour chauffeurs gig et travailleurs autonomes au Québec.

> ⚠️ Informations à titre indicatif. Consulter un comptable pour validation officielle.

## Taux de taxes 2024–2025 (Québec)

| Taxe | Taux | Seuil d'inscription |
|------|------|---------------------|
| TPS (fédérale) | 5% | > 30 000$ revenus/an |
| TVQ (provinciale) | 9.975% | > 30 000$ revenus/an |
| Total taxes de vente | ~14.975% | — |

## Catégories de déductions — Chauffeur Gig

### Déductibilité 100% (usage professionnel exclusif)

```
✅ Frais de plateforme (commissions Lyft, DoorDash, Skip, Hypra)
✅ Téléphone (portion professionnelle — calculer % usage pro)
✅ Support de téléphone pour véhicule
✅ Chargeur de téléphone pour voiture
✅ Dash cam
✅ Extincteur de bord
✅ Trousse de premiers soins (véhicule)
✅ Eau/collations offertes aux passagers (reçus conservés)
✅ Application GPS professionnelle (Waze Carpool, etc.)
✅ Abonnement radio/musique (si pour passagers — partiel)
✅ Frais bancaires (compte pro séparé)
✅ Comptable / logiciel comptabilité
✅ Formation liée à l'activité
```

### Déductibilité proportionnelle — Véhicule

La déduction véhicule est calculée selon le **ratio km professionnels / km totaux**.

```
Ratio pro = km_pro / (km_pro + km_perso)
```

**Dépenses véhicule déductibles au prorata :**
- Essence
- Assurance (portion pro)
- Entretien / réparations
- Pneus
- Lavage de voiture
- Immatriculation
- Intérêts sur prêt auto (si financement)
- Dépréciation (selon classe CII)

**Méthode de calcul recommandée :**

```python
km_pro = 28000      # km parcourus en service
km_perso = 5000     # km personnels
km_total = km_pro + km_perso

ratio_pro = km_pro / km_total  # ex: 0.848 = 84.8%

depenses_vehicule_total = 8500  # essence + assurance + entretien...
deduction_vehicule = depenses_vehicule_total * ratio_pro
# = 8500 * 0.848 = 7208$
```

> 📋 Tenir un **carnet de bord** (date, destination, km, motif) — obligatoire si audit.

### Déductibilité 50% (mixte pro/perso)

```
⚖️ Bureau à domicile (espace dédié uniquement)
⚖️ Internet à domicile
⚖️ Repas d'affaires (50% — avec client/partenaire)
⚖️ Téléphone personnel (si aussi usage pro)
```

### Non déductible (0%)

```
❌ Amendes / contraventions
❌ Vêtements personnels (sauf uniforme obligatoire)
❌ Nourriture personnelle
❌ Dépenses sans reçu
❌ Portion personnelle du véhicule
```

## Catégorisation rapide Amazon / reçus

### Logique de classification

```
Article acheté → Usage exclusif pro? 
  OUI → 100% déductible
  NON → Usage mixte?
    OUI (bureau/téléphone/internet) → 50%
    NON → 0%
```

### Table de référence rapide

| Catégorie Amazon | Déductibilité | Exemples |
|---|---|---|
| Électronique pro | 100% | Dash cam, support téléphone, chargeur auto |
| Accessoires véhicule | 100% | Tapis, extincteur, désodorisant (pro) |
| Fournitures bureau | 50% | Imprimante, cartouches, câbles |
| Informatique | 50% | Souris, clavier, webcam |
| Personnel | 0% | Vêtements, appareils maison |

## Formulaires fiscaux requis (Québec)

| Formulaire | Usage | Où |
|---|---|---|
| **TP-80** | Revenus/dépenses travail autonome | Revenu Québec |
| **T2125** | Revenus/dépenses travail autonome | CRA fédéral |
| **TP-526** | Frais de véhicule | Revenu Québec |
| **T777** | Frais d'emploi / véhicule | CRA fédéral |
| **RC4082** | Guide TPS/TVH travailleurs autonomes | CRA |

## Calcul TPS/TVQ réclamable (ITCs / RTIs)

Si inscrit aux taxes de vente, récupérer les taxes payées sur achats pro :

```python
montant_ht = 100.00
tps_payee = 5.00    # récupérable (ITC)
tvq_payee = 9.975   # récupérable (RTI)

# Rembourser en déduisant des taxes collectées sur revenus
```

## Suivi recommandé — Spreadsheet mensuel

```
Colonnes suggérées :
Date | Fournisseur | Description | Montant HT | TPS | TVQ | Catégorie | Déductibilité% | Déductible$
```

## Limites importantes 2024

- **Plafond dépréciation voiture** (CII classe 10.1) : 38 000$ (prix d'achat max reconnu)
- **Taux kilométrique simplifié** : 0,70$/km (premiers 5 000 km), 0,64$/km ensuite (méthode forfaitaire fédérale)
- **Bureau domicile** : seulement si espace utilisé régulièrement et exclusivement pour travail
