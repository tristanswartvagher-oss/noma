import { Food, Recipe, RecipeLearning } from './types';

export function recipeNutrition(
  recipe:Recipe, foods:Food[], learning?:RecipeLearning, servings?:number
){
  const overall=learning?.overallMultiplier||1;
  const scale=(servings||recipe.defaultServings)/recipe.defaultServings;
  let kcal=0,protein=0,carbs=0,fat=0,fiber=0;
  for(const ing of recipe.ingredients){
    const f=foods.find(x=>x.id===ing.foodId); if(!f) continue;
    const im=learning?.ingredientMultipliers?.[ing.foodId]||1;
    const grams=ing.grams*scale*overall*im;
    const ratio=grams/100;
    kcal+=f.kcal*ratio; protein+=f.protein*ratio; carbs+=f.carbs*ratio; fat+=f.fat*ratio; fiber+=f.fiber*ratio;
  }
  return {kcal,protein,carbs,fat,fiber};
}
export function perServing(recipe:Recipe, foods:Food[], learning?:RecipeLearning){
  const t=recipeNutrition(recipe,foods,learning,recipe.defaultServings);
  return Object.fromEntries(Object.entries(t).map(([k,v])=>[k,v/recipe.defaultServings])) as typeof t;
}
export function roundMacro(n:number){ return Math.round(n*10)/10; }
