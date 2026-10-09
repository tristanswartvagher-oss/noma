/**
 * Photos contrôlées individuellement par ID recette.
 *
 * Ne JAMAIS déduire une photographie depuis les mots-clés du titre.
 * Un plat sans photographie validée est rendu sous forme d'illustration locale.
 *
 * Chaque visuel référencé ici correspond à un plat identifiable et à une photo
 * annoncée comme gratuite sous licence Unsplash au 09/10/2026.
 * La représentation photographique n'est pas une garantie de portions / macros.
 *
 * ATTENTION : contrôler la fiabilité du téléchargement et les droits tiers
 * avant publication commerciale (voir docs/RECIPE_MEDIA_RIGHTS.md).
 */
export const recipePhotoMap:Record<string,string>={
  porridge:'https://unsplash.com/photos/qzRVPgqSWn4/download?w=960',
  greek_salad:'https://unsplash.com/photos/25SHQMgsWEQ/download?w=960',
  hummus:'https://unsplash.com/photos/cGhkqHN0Kfc/download?w=960',
  pancakes:'https://unsplash.com/photos/tKKe3aDvncE/download?w=960',
  protein_pancakes:'https://unsplash.com/photos/mcJcNdy8-IQ/download?w=960',
  bolognese:'https://unsplash.com/photos/rQCBC9EgoDE/download?w=960'
};
