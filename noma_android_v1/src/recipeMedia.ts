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
  porridge:'https://images.unsplash.com/photo-1715098841757-0e9690ec12d6?auto=format&fit=crop&w=960&q=80',
  greek_salad:'https://images.unsplash.com/photo-1778449532114-430396ada55b?auto=format&fit=crop&w=960&q=80',
  hummus:'https://images.unsplash.com/photo-1783696074463-3fb850d181a1?auto=format&fit=crop&w=960&q=80',
  pancakes:'https://images.unsplash.com/photo-1568240464340-261c0f65a455?auto=format&fit=crop&w=960&q=80',
  protein_pancakes:'https://images.unsplash.com/photo-1575853121613-72ce1dd6979d?auto=format&fit=crop&w=960&q=80',
  bolognese:'https://images.unsplash.com/photo-1761545832779-bc0b4290fc5e?auto=format&fit=crop&w=960&q=80'
};
