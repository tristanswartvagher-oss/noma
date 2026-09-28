export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type RecipeCategory = 'Entrée' | 'Plat' | 'Dessert & Encas';

export type Food = {
  id:string; name:string; normalizedName:string; category:string;
  state:'raw'|'dry'|'cooked'|'drained'|'ready_to_eat';
  referenceQuantity:number; referenceUnit:'g'|'ml';
  kcal:number; protein:number; carbs:number; fat:number; fiber:number;
  source:string; verified:boolean;
};

export type RecipeIngredient = {
  foodId:string; amount:number; unit:string; grams:number;
};

export type Recipe = {
  id:string; title:string; category:RecipeCategory; defaultServings:number;
  timeMinutes:number; emoji:string; ingredients:RecipeIngredient[];
  steps:string[]; tags:string[]; custom?:boolean;
};

export type PlannedMeal = { recipeId:string; servings:number };
export type WeekPlan = Record<string, Partial<Record<MealType, PlannedMeal>>>;

export type RecipeLearning = {
  overallMultiplier:number;
  ingredientMultipliers:Record<string,number>;
  notes:string[];
  rating?:number;
};

export type NutritionGoals = {
  enabled:boolean; kcal:number; protein:number; carbs:number; fat:number;
};
