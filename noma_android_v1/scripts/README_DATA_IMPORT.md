# Import nutritionnel vérifié

La V1 contient une base locale de démarrage afin que l'app fonctionne immédiatement.
Les lignes sont marquées `verified: false` tant qu'elles n'ont pas été rapprochées d'une source officielle.

Pour la production, remplacer/compléter `src/seedFoods.json` par un export vérifié (CIQUAL/ANSES ou autre source autorisée).
Conserver les IDs utilisés dans `seedRecipes.json` ou fournir une table de correspondance.

Colonnes recommandées:
id,name,normalizedName,category,state,referenceQuantity,referenceUnit,kcal,protein,carbs,fat,fiber,source,verified
