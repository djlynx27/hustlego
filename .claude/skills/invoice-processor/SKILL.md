---
name: invoice-processor
description: Extraction automatique de données depuis des factures (Amazon, fournisseurs, reçus) et catégorisation fiscale. Utilise ce skill dès que l'utilisateur partage des factures, reçus, ou demande de traiter un lot de factures pour déductions fiscales, comptabilité, ou saisie dans un tableur. Optimisé pour les factures Amazon Canada et les workflows de déduction TPS/TVQ.
---

# Invoice Processor

Extraction et catégorisation automatique de données depuis des factures.

## Workflow standard

```
Factures (PDF/image/texte) 
  → Extraction des champs clés
  → Catégorisation fiscale
  → Export CSV/Excel avec colonnes structurées
```

## Champs à extraire

Pour chaque facture, extraire systématiquement :

```
- Numéro de commande / facture
- Date
- Fournisseur (Amazon, Best Buy, etc.)
- Description des articles
- Montant HT (avant taxes)
- TPS (5%)
- TVQ (9.975%) ou TVP provinciale
- Total TTC
- Méthode de paiement
```

## Structure de sortie standard

```csv
#,Date,Commande,Fournisseur,Description,Montant_HT,TPS,TVQ,Total_TTC,Categorie,Deductibilite_%,Montant_Deductible
1,2024-01-15,114-XXXXXXX,Amazon,Dash cam Vantrue,89.99,4.50,8.97,103.46,Électronique pro,100%,89.99
2,2024-01-18,114-XXXXXXX,Amazon,Support téléphone voiture,24.99,1.25,2.49,28.73,Accessoires véhicule,100%,24.99
```

## Logique de catégorisation automatique

### Règles par mots-clés (Amazon Canada)

```python
CATEGORIES = {
    # 100% déductible
    "dash cam": ("Électronique pro", 100),
    "support téléphone": ("Accessoires véhicule", 100),
    "chargeur voiture": ("Accessoires véhicule", 100),
    "extincteur": ("Sécurité véhicule", 100),
    "trousse premiers soins": ("Sécurité véhicule", 100),
    "désodorisant": ("Entretien véhicule", 100),
    "nettoyant voiture": ("Entretien véhicule", 100),
    "eau bouteille": ("Confort passagers", 100),
    "sac isotherme": ("Livraison", 100),
    "insulated bag": ("Livraison", 100),
    
    # 50% déductible
    "imprimante": ("Bureau domicile", 50),
    "cartouche": ("Bureau domicile", 50),
    "clavier": ("Informatique", 50),
    "souris": ("Informatique", 50),
    "webcam": ("Informatique", 50),
    "câble": ("Électronique mixte", 50),
    
    # 0% — personnel
    "vêtement": ("Personnel", 0),
    "jouet": ("Personnel", 0),
    "livre": ("Personnel", 0),
}

def categorize(description: str) -> tuple:
    desc_lower = description.lower()
    for keyword, (cat, pct) in CATEGORIES.items():
        if keyword in desc_lower:
            return cat, pct
    return "À vérifier", None  # Nécessite révision manuelle
```

## Format de résumé par lot

```
LOT #XX — Factures #NNN à #MMM
═══════════════════════════════
Articles traités : XX
100% déductibles : XX articles → XXX.XX$ HT
50% déductibles  : XX articles → XXX.XX$ HT (→ XXX.XX$ effectif)
0% / Personnel   : XX articles
À vérifier       : XX articles

TOTAL DÉDUCTIBLE CE LOT : XXX.XX$ (avant taxes)
CUMUL TOTAL            : X XXX.XX$ (avant taxes)

TPS récupérable (ITC)  : XX.XX$
TVQ récupérable (RTI)  : XX.XX$
```

## Gestion des articles multi-lignes

Pour les commandes avec plusieurs articles :
1. Séparer chaque article sur sa propre ligne
2. Répartir les taxes proportionnellement si non détaillées
3. Conserver le numéro de commande parent sur chaque ligne

## Signaux d'alerte à relever

```
⚠️  Montant > 500$ → Vérification manuelle recommandée
⚠️  Catégorie "À vérifier" → Soumettre à l'utilisateur
⚠️  Taxes manquantes → Calculer: HT × 0.05 (TPS) + HT × 0.09975 (TVQ)
⚠️  Article potentiellement personnel → Demander confirmation
```

## Couleurs Excel (si export .xlsx)

```
🟢 Vert  (#C6EFCE) → 100% déductible
🟡 Jaune (#FFEB9C) → 50% déductible  
🔴 Rouge (#FFC7CE) → 0% / Personnel
⬜ Blanc → À vérifier
```
