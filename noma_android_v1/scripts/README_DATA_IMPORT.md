# Données nutritionnelles

La V2 embarque 105 aliments de démarrage afin de rendre l'application utilisable hors ligne.
Ils sont explicitement marqués `verified: false`.

Pour une diffusion publique, importer une source vérifiée et autorisée, par exemple CIQUAL/ANSES,
puis renseigner pour chaque aliment :

- id
- name
- normalizedName
- category
- state
- referenceQuantity
- referenceUnit (`g` ou `ml`)
- kcal
- protein
- carbs
- fat
- fiber
- source
- sourceId
- verified
- pieceWeight (optionnel, pour convertir `pièce` vers l'unité nutritionnelle)

Les recettes pointent vers `Food.id`. Pour remplacer un aliment existant sans casser les recettes,
conserver son ID ou fournir une table de correspondance.
