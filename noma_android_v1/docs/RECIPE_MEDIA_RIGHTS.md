# NOMA — provenance des visuels culinaires

La V3.2 utilisait une affectation d'images génériques à partir de mots-clés du titre. C'est une erreur : par exemple, « Porridge banane » pouvait afficher une photo de bowl salé.

## Nouvelle règle

L'affectation d'une photographie se fait exclusivement par **identifiant canonique de recette** dans `src/recipeMedia.ts`. Lorsque la photo n'a pas été vérifiée ou que le réseau échoue, l'application montre une illustration locale clairement différente d'une photographie. Aucune image n'est déduite à partir d'un mot-clé. Les ingrédients visibles dans une photo ne doivent pas être interprétés comme une liste exacte des ingrédients ou macros.

## Photographies retenues (pages originales et titulaires)

| Recette | Source | Photographe | État |
|---|---|---|---|
| `porridge` : Porridge banane | https://unsplash.com/photos/a-bowl-of-oatmeal-with-banana-slices-on-top-qzRVPgqSWn4 | Dimitris Asproloupos | Titre photo contrôlé / affichage réel sur mobile à vérifier |
| `greek_salad` : Salade grecque | https://unsplash.com/photos/a-greek-salad-with-feta-cheese-olives-and-cucumbers-25SHQMgsWEQ | Shoeib Abolhassani | Contrôlé / mobile à vérifier |
| `hummus` : Houmous maison | https://unsplash.com/photos/creamy-hummus-and-a-savory-dip-with-crumbled-toppings-cGhkqHN0Kfc | Tommaso Ubezio | Contrôlé / mobile à vérifier |
| `pancakes` : Pancakes | https://unsplash.com/photos/stack-of-pancakes-on-plate-tKKe3aDvncE | Kim Streicher | Contrôlé / mobile à vérifier |
| `protein_pancakes` : Pancakes skyr banane | https://unsplash.com/photos/three-pancakes-with-blueberries-sliced-banana-and-sugar-on-top-mcJcNdy8-IQ | Estúdio Bloom | Contrôlé / mobile à vérifier |
| `bolognese` : Spaghetti bolognaise | https://unsplash.com/photos/spaghetti-bolognese-served-on-a-teal-plate-with-garnishes-rQCBC9EgoDE | Zayed Ahmed Zadu | Contrôlé / mobile à vérifier |

Les pages indiquaient « Free to use under the Unsplash License » au 09/10/2026 : https://unsplash.com/license.

## Conditions avant sortie publique

1. Vérifier sur appareil que la redirection `/download` fournit l'image et respecte les conditions de diffusion ; sinon désactiver la photographie au profit de l'illustration locale.
2. Vérifier les droits tiers (marques, personnes, œuvres incluses dans l'image) au cas par cas.
3. Ne jamais déclarer les images « exactes » quant aux ingrédients et quantités.
4. Pour les 54 autres recettes, ne pas fabriquer des correspondances. La couverture photographique du catalogue reste un chantier distinct.
5. Ajouter une option de photo personnelle uniquement dans un développement futur maîtrisé (stockage, sauvegarde, confidentialité).

Référence pour droits tiers : https://help.unsplash.com/fr/articles/2612329-autorisations-et-marques-commerciales

Ce registre est un suivi des autorisations déclarées par la plateforme, non une certification juridique.
