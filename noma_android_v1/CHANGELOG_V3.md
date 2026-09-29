# Noma 1.2.0 — V3

## Nouveautés
- Repas externe sans IA : nom + kcal + protéines + glucides + lipides saisis manuellement.
- Les repas externes comptent dans les macros journalières mais jamais dans les courses.
- Modification/suppression d’un repas externe depuis le planning.
- Barre d’onglets adaptée à la Safe Area Android pour ne plus chevaucher la barre système.
- Migration automatique du schéma V2 vers V3 sans supprimer les données locales.

## Nutrition
- Audit automatique des 105 aliments de la base seed.
- Audit des 60 recettes par recalcul ingrédient × quantité / 100, puis somme et division par portions.
- Fichiers `FOOD_MACRO_AUDIT.csv` et `RECIPE_MACRO_AUDIT.csv`.
- Aucun aliment n’est marqué `verified:true` sans rapprochement avec une source officielle.
- 5 aliments restent explicitement en `review_external` avant publication publique.

## Version
- App 1.2.0
- Android versionCode 3
- Schéma local V3
