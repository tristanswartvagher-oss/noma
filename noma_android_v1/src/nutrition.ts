import {Food,Recipe,RecipeIngredient,RecipeLearning} from './types';

export type Macros={kcal:number;protein:number;carbs:number;fat:number;fiber:number};

/** All food nutrient references are per 100 g, never per 100 ml or per piece. */
export function ingredientWeightGrams(ing:RecipeIngredient,food?:Food):number{
  const amount=Number(ing.amount);
  if(!Number.isFinite(amount)||amount<0) return NaN;
  if(ing.unit==='g') return amount;
  if(ing.unit==='ml'){
    const density=food?.densityGPerMl;
    return typeof density==='number'&&Number.isFinite(density)&&density>0?amount*density:NaN;
  }
  if(ing.unit==='pièce'){
    const piece=food?.pieceWeight;
    return typeof piece==='number'&&Number.isFinite(piece)&&piece>0?amount*piece:NaN;
  }
  return NaN;
}

/** Legacy nutritionAmount is deliberately ignored: it was wrong for ml quantities. */
export function nutritionAmount(ing:RecipeIngredient,food?:Food):number{
  return ingredientWeightGrams(ing,food);
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
  const byId=new Map(foods.map(f=>[f.id,f]));

  for(const ing of recipe.ingredients){
    const food=byId.get(ing.foodId);
    if(!food) throw new Error('Aliment introuvable : '+ing.foodId);
    const grams=ingredientWeightGrams(ing,food);
    if(!Number.isFinite(grams)||grams<0)
      throw new Error('Unité ou densité non prise en charge : '+ing.foodId+' ('+ing.unit+')');
    const personal=learning?.ingredientMultipliers?.[ing.foodId]||1;
    const ratio=(grams*scale*overall*personal)/food.referenceQuantity;
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
