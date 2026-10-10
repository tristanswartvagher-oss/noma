# NOMA — provenance et audit des photos de recettes

## Source intégrée

60 associations par ID canonique de recette, 59 fichiers JPEG locaux optimisés à partir de l’archive remise par l’utilisateur, `NOMA_toutes_les_images_recettes(1).zip`. Les photos sont stockées sous `assets/recipe-photos/` et sont accessibles **sans connexion Internet** via des `require()` statiques dans `src/recipeMedia.ts`. Les 6 anciennes URLs Unsplash ont été retirées de la carte utilisée dans l’application.

## Traçabilité

`docs/recipe-images-manifest.json` indique pour chaque recette :
- l’ID canonique et son titre ;
- le nom exact de l’image source du ZIP ;
- le fichier embarqué, sa taille et son empreinte SHA-256 ;
- le niveau de correspondance (`exact`, `strong`, `approx`) et ses réserves.

Audit : **38 exactes, 17 fortes, 5 approximatives**, dont :
- `greek_salad` : salade méditerranéenne avec quinoa ;
- `hummus` : houmous présent, mais aussi falafels et accompagnements ;
- `turkey_meatballs` : boulettes sauce tomate sans garantie que la viande représentée soit de la dinde ;
- `porridge` : bol d’avoine proche d’overnight oats pomme-cannelle ;
- `protein_pancakes` : réutilise l’image de `pancakes` faute de photo distincte.

Les photographies sont illustratives. Elles ne garantissent pas l’exhaustivité ni les quantités des ingrédients nutritionnels. Les droits d’exploitation commerciale et les éventuels droits tiers (marques/personnes/éléments protégés) devront être vérifiés avant publication. Le fait qu'un fichier soit fourni par l’utilisateur ne constitue pas une certification juridique.

## Vérification technique

`npm run test:recipe-images` contrôle les 60 IDs, l’existence des 59 fichiers, les empreintes SHA-256, les `require()` statiques et les 327 étapes intactes. `npx expo export --platform android` vérifie que Metro sait embarquer les assets sur Android.