export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type RecipeCategory = 'Entrée' | 'Plat' | 'Dessert & Encas';
export type IngredientUnit = 'g' | 'ml' | 'pièce';

export type Food = {
  id:string;
  name:string;
  normalizedName:string;
  category:string;
  state:'raw'|'dry'|'cooked'|'drained'|'ready_to_eat';
  referenceQuantity:number;
  referenceUnit:'g'|'ml';
  pieceWeight?:number;
  kcal:number;
  protein:number;
  carbs:number;
  fat:number;
  fiber:number;
  source:string;
  sourceId?:string;
  verified:boolean;
  auditStatus?:'passed_internal'|'review_external';
  auditNote?:string;
};

export type RecipeIngredient = {
  foodId:string;
  amount:number;
  unit:IngredientUnit;
  /** Quantity expressed in Food.referenceUnit, used only for nutrition. */
  nutritionAmount:number;
  /** Legacy V1 field, read only during migration. */
  grams?:number;
};

export type Recipe = {
  id:string;
  title:string;
  category:RecipeCategory;
  defaultServings:number;
  timeMinutes:number;
  emoji:string;
  ingredients:RecipeIngredient[];
  steps:string[];
  tags:string[];
  custom?:boolean;
};

export type RecipePlannedMeal = {
  kind:'recipe';
  recipeId:string;
  /** Portions prepared: drives the grocery list. */
  cookedServings:number;
  /** Portions eaten by the current user: drives daily macros. */
  consumedServings:number;
  /** Legacy V1 field. */
  servings?:number;
};

export type ExternalPlannedMeal = {
  kind:'external';
  name:string;
  kcal:number;
  protein:number;
  carbs:number;
  fat:number;
  note?:string;
};

export type PlannedMeal = RecipePlannedMeal | ExternalPlannedMeal;
export type WeekPlan = Record<string, Partial<Record<MealType, PlannedMeal>>>;

export type RecipeLearning = {
  overallMultiplier:number;
  ingredientMultipliers:Record<string,number>;
  notes:string[];
  rating?:number;
  updatedAt?:string;
};

export type NutritionGoals = {
  enabled:boolean;
  kcal:number;
  protein:number;
  carbs:number;
  fat:number;
};

export type CustomGrocery = {
  id:string;
  label:string;
  checked:boolean;
};

export type GroceryWeekState = Record<string, Record<string,boolean>>;

export function isRecipeMeal(meal:PlannedMeal):meal is RecipePlannedMeal{
  return meal.kind==='recipe';
}

export function isExternalMeal(meal:PlannedMeal):meal is ExternalPlannedMeal{
  return meal.kind==='external';
}
