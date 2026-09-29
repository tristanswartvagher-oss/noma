# Noma Android — V2 / 1.1.0

Cette version remplace la V1 tout en conservant le package Android `com.noma.mealplanner`
et la clé de stockage `noma-v1-state`, afin que les données locales puissent être migrées
lors d'une mise à jour installée par-dessus la V1.

## Ce qui change

### Semaine
- navigation semaine précédente / suivante / aujourd'hui ;
- 7 jours × Petit-déj / Déjeuner / Dîner ;
- ajout, remplacement et suppression d'un repas ;
- séparation **À préparer** / **Pour moi** :
  - À préparer = quantité utilisée pour les courses ;
  - Pour moi = quantité utilisée pour les macros journalières.

### Macros
- kcal / protéines / glucides / lipides calculés à partir des ingrédients ;
- total quotidien basé uniquement sur les portions consommées ;
- objectifs journaliers dans Profil ;
- adaptations Noma intégrées aux calculs.

### Courses
- uniquement les repas de la semaine sélectionnée ;
- cases cochées indépendantes par semaine ;
- `J'en ai déjà` indépendant par semaine ;
- ajouts manuels cochables et supprimables ;
- unités g / ml / pièce ;
- fusion des ingrédients identiques.

### Recettes
- 60 recettes système : 15 entrées, 30 plats, 15 desserts/encas ;
- favoris ;
- recherche par nom, tag ou ingrédient, sans dépendre des accents ;
- création, édition et suppression des recettes personnelles ;
- choix de catégorie ;
- suppression d'un ingrédient dans le formulaire.

### Noma apprend
- feedback privé ;
- quantité globale ;
- ajustement par ingrédient ;
- affichage des multiplicateurs dans la fiche recette ;
- suppression d'un ajustement précis ou reset complet ;
- recette système d'origine jamais modifiée.

### Données
- schéma local V2 ;
- migration automatique des données V1 ;
- les anciennes `servings` deviennent `cookedServings` ;
- `consumedServings` démarre à 1 pour les anciens repas ;
- les anciennes listes de courses sont rattachées à la semaine courante.

## Base nutritionnelle

La base locale embarquée contient 105 aliments et permet de tester l'ensemble du moteur.
Les valeurs sont encore marquées `verified: false`. Elles ne doivent pas être présentées
comme des valeurs CIQUAL officielles tant qu'un import vérifié n'a pas été effectué.

La structure est prête pour une base officielle :
- `source`
- `sourceId`
- `verified`
- `referenceUnit`
- `pieceWeight`

## Build Android

Après remplacement des fichiers dans Codespaces :

```bash
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
npx expo-doctor
npx expo export --platform android
npx eas-cli@latest build -p android --profile preview --clear-cache
```

Le profil `preview` produit un APK installable directement.
La version Android de cette release est `versionCode: 2`.


## V3 — 1.2.0

Cette version ajoute les repas externes saisis manuellement (sans IA), corrige l'espace de la barre
d'onglets Android et introduit le schéma de stockage V3.

Les macros des recettes sont toujours calculées à partir des aliments :
`macro aliment / 100 × quantité nutritionnelle`, somme des ingrédients, puis division par portions.

Deux audits sont inclus :
- `FOOD_MACRO_AUDIT.csv`
- `RECIPE_MACRO_AUDIT.csv`

Important : l'audit interne ne remplace pas une certification CIQUAL. Les aliments restent
`verified:false` tant que leurs valeurs n'ont pas été rapprochées d'une source externe officielle.
