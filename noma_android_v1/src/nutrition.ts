import {Food,Recipe,RecipeIngredient,RecipeLearning} from './types';

export type Macros={kcal:number;protein:number;carbs:number;fat:number;fiber:number};

export function nutritionAmount(ing:RecipeIngredient,food?:Food){
  if(typeof ing.nutritionAmount==='number') return ing.nutritionAmount;
  if(typeof ing.grams==='number') return ing.grams;
  if(ing.unit==='pièce' && food?.pieceWeight) return ing.amount*food.pieceWeight;
  return ing.amount;
}

export function recipeNutrition(
  recipe:Recipe,
  foods:Food[],
  learning?:RecipeLearning,
  cookedServings=recipe.defaultServings
):Macros{
  const overall=learning?.overallMultiplier||1;
  const scale=cookedServings/recipe.defaultServings;
  const total:Macros={kcal:0,protein:0,carbs:0,fat:0,fiber:0};

  for(const ing of recipe.ingredients){
    const food=foods.find(x=>x.id===ing.foodId);
    if(!food) continue;
    const personal=learning?.ingredientMultipliers?.[ing.foodId]||1;
    const normalized=nutritionAmount(ing,food)*scale*overall*personal;
    const ratio=normalized/100;
    total.kcal+=food.kcal*ratio;
    total.protein+=food.protein*ratio;
    total.carbs+=food.carbs*ratio;
    total.fat+=food.fat*ratio;
    total.fiber+=food.fiber*ratio;
  }
  return total;
}

export function perServing(recipe:Recipe,foods:Food[],learning?:RecipeLearning):Macros{
  const total=recipeNutrition(recipe,foods,learning,recipe.defaultServings);
  return {
    kcal:total.kcal/recipe.defaultServings,
    protein:total.protein/recipe.defaultServings,
    carbs:total.carbs/recipe.defaultServings,
    fat:total.fat/recipe.defaultServings,
    fiber:total.fiber/recipe.defaultServings
  };
}

export function macrosForConsumedServings(
  recipe:Recipe,foods:Food[],learning:RecipeLearning|undefined,consumed:number
):Macros{
  const one=perServing(recipe,foods,learning);
  return {
    kcal:one.kcal*consumed,
    protein:one.protein*consumed,
    carbs:one.carbs*consumed,
    fat:one.fat*consumed,
    fiber:one.fiber*consumed
  };
}

export function roundMacro(n:number){return Math.round(n*10)/10}
