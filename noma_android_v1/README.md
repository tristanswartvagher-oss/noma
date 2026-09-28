# Noma Android — V1

Application mobile React Native / Expo correspondant au périmètre V1 validé.

## Inclus
- 7 jours × 3 repas (Petit-déj / Déjeuner / Dîner)
- 60 recettes initiales : 15 entrées, 30 plats, 15 desserts/encas
- Base locale d'aliments de démarrage
- Recherche d'aliments
- Création de recettes personnelles
- Calcul kcal / protéines / glucides / lipides à partir des ingrédients
- Objectifs journaliers
- Ajustement du nombre de portions
- Liste de courses fusionnée sur toute la semaine
- Cases à cocher + "J'en ai déjà" + ajouts manuels
- Feedback privé après repas
- Ajustements par ingrédient mémorisés et appliqués aux prochaines courses
- Persistance locale
- 4 onglets seulement
- Configuration EAS pour produire un APK de test

## Convention nutrition
Les quantités sont avant cuisson par défaut:
- riz/pâtes/quinoa/lentilles = secs
- viande/poisson = crus
- une entrée `cooked`/`drained` n'est utilisée que si explicitement nécessaire

## Données nutritionnelles
La base incluse sert à rendre la V1 fonctionnelle. Les entrées sont volontairement marquées `verified: false`.
Avant une diffusion publique, il faut remplacer/valider ces données à partir d'une source de référence (par ex. CIQUAL/ANSES) plutôt que prétendre qu'elles sont officielles.

## APK
`eas.json` contient un profil `preview` qui produit un APK Android d'installation directe.

Commande de build, une fois le projet relié à un compte Expo:
`eas build -p android --profile preview`

Le service EAS renverra alors une URL de téléchargement de l'APK.
