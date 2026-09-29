# Audit macros — Noma V3

Date : 2026-09-28

## Ce qui a été vérifié

Les 105 aliments de `src/seedFoods.json` ont été parcourus automatiquement : valeurs non négatives,
bornes physiques plausibles, cohérence `fibres <= glucides`, somme P/G/L plausible, unité de référence
présente, et contrôle énergétique indicatif de type Atwater.

Les 60 recettes ont ensuite été recalculées ingrédient par ingrédient avec exactement la formule de l'app :

`valeur aliment pour 100 × quantité nutritionnelle / 100`, puis somme de tous les ingrédients,
puis division par le nombre de portions pour les valeurs par portion.

`RECIPE_MACRO_AUDIT.csv` contient le résultat de ce recalcul pour les 60 recettes.

## Limite importante

Ce contrôle prouve que les calculs de Noma sont cohérents avec les données stockées. Il ne transforme pas
la base seed en base officielle CIQUAL. Les 105 aliments restent donc `verified: false` tant qu'un
rapprochement ligne par ligne avec une source de composition officielle/licenciée n'a pas été effectué.

Cinq aliments sont explicitement laissés en `review_external` : cacao non sucré, levure chimique,
extrait de vanille, huile d’olive et huile de colza. Les trois premiers ont un écart important avec une
formule Atwater simplifiée ; pour les deux huiles, la base 100 g / 100 ml doit être certifiée par la
source externe. Cela évite de présenter comme "vérifiée" une conversion de densité non sourcée.

Aucune valeur n'a été "corrigée" sans source externe fiable.
