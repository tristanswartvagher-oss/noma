import {weekDays,isoDay,fromIso} from './date';
import {Food,Recipe,RecipeLearning,WeekPlan,IngredientUnit,isRecipeMeal} from './types';

export type Grocery={
  key:string; foodId:string; name:string; category:string;
  amount:number; unit:IngredientUnit;
};

export function buildGroceriesForWeek(
  plan:WeekPlan,weekStart:string,recipes:Recipe[],foods:Food[],
  learning:Record<string,RecipeLearning>
){
  const dates=new Set(weekDays(fromIso(weekStart)).map(isoDay));
  const merged=new Map<string,Grocery>();

  Object.entries(plan).forEach(([date,day])=>{
    if(!dates.has(date)) return;
    Object.values(day||{}).forEach(pm=>{
      if(!pm||!isRecipeMeal(pm)) return; // external meals never enter groceries
      const recipe=recipes.find(r=>r.id===pm.recipeId);
      if(!recipe) return;
      const learned=learning[recipe.id];
      const overall=learned?.overallMultiplier||1;
      const scale=pm.cookedServings/recipe.defaultServings;

      recipe.ingredients.forEach(ing=>{
        const food=foods.find(f=>f.id===ing.foodId); if(!food) return;
        const personal=learned?.ingredientMultipliers?.[ing.foodId]||1;
        const amount=ing.amount*scale*overall*personal;
        const key=`${food.id}:${ing.unit}`;
        const old=merged.get(key);
        if(old) old.amount+=amount;
        else merged.set(key,{key,foodId:food.id,name:food.name,category:food.category,
          amount,unit:ing.unit});
      });
    });
  });

  return [...merged.values()].sort((a,b)=>
    a.category.localeCompare(b.category)||a.name.localeCompare(b.name)
  );
}

export function prettyQuantity(amount:number,unit:IngredientUnit){
  if(unit==='g'){
    if(amount>=1000) return `${Math.round(amount/100)/10} kg`;
    return `${Math.round(amount)} g`;
  }
  if(unit==='ml'){
    if(amount>=1000) return `${Math.round(amount/100)/10} L`;
    return `${Math.round(amount)} ml`;
  }
  const rounded=Math.round(amount*10)/10;
  return `${rounded} ${rounded>1?'pièces':'pièce'}`;
}
