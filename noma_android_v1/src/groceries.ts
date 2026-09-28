import {Food,Recipe,RecipeLearning,WeekPlan} from './types';
export type Grocery={key:string;foodId:string;name:string;category:string;grams:number};
export function buildGroceries(plan:WeekPlan,recipes:Recipe[],foods:Food[],learning:Record<string,RecipeLearning>){
  const m=new Map<string,Grocery>();
  Object.values(plan).forEach(day=>Object.values(day||{}).forEach(pm=>{
    if(!pm)return;const r=recipes.find(x=>x.id===pm.recipeId);if(!r)return;
    const l=learning[r.id],overall=l?.overallMultiplier||1,scale=pm.servings/r.defaultServings;
    r.ingredients.forEach(i=>{const f=foods.find(x=>x.id===i.foodId);if(!f)return;const im=l?.ingredientMultipliers?.[i.foodId]||1;const grams=i.grams*scale*overall*im;const old=m.get(f.id);if(old)old.grams+=grams;else m.set(f.id,{key:f.id,foodId:f.id,name:f.name,category:f.category,grams})})
  }));
  return [...m.values()].sort((a,b)=>a.category.localeCompare(b.category)||a.name.localeCompare(b.name));
}
export function prettyWeight(g:number){if(g>=1000)return `${Math.round(g/100)/10} kg`;return `${Math.round(g/5)*5} g`}
