import AsyncStorage from '@react-native-async-storage/async-storage';
import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import seedFoods from './seedFoods.json';
import seedRecipes from './seedRecipes.json';
import {isoDay,mondayOf,weekDays,weekKey} from './date';
import {
  CustomGrocery,ExternalPlannedMeal,Food,GroceryWeekState,MealType,NutritionGoals,
  Recipe,RecipeIngredient,RecipeLearning,WeekPlan,isRecipeMeal
} from './types';

const STORAGE_KEY='noma-v1-state';
const SCHEMA_VERSION=3;

type StoreState={
  schemaVersion:number;
  foods:Food[];
  recipes:Recipe[];
  plan:WeekPlan;
  learning:Record<string,RecipeLearning>;
  groceryChecked:GroceryWeekState;
  alreadyHave:GroceryWeekState;
  customGroceries:Record<string,CustomGrocery[]>;
  favorites:Record<string,boolean>;
  goals:NutritionGoals;
  householdSize:number;
  selectedWeekStart:string;
  loaded:boolean;
};

type Ctx=StoreState&{
  setMeal:(date:string,type:MealType,recipeId:string,cookedServings?:number)=>void;
  setExternalMeal:(date:string,type:MealType,meal:Omit<ExternalPlannedMeal,'kind'>)=>void;
  removeMeal:(date:string,type:MealType)=>void;
  changeCookedServings:(date:string,type:MealType,delta:number)=>void;
  changeConsumedServings:(date:string,type:MealType,delta:number)=>void;

  saveFeedback:(recipeId:string,quantity:'low'|'perfect'|'high',rating:number,note:string,changes:Record<string,number>)=>void;
  resetRecipeLearning:(recipeId:string)=>void;
  resetIngredientAdjustment:(recipeId:string,foodId:string)=>void;

  toggleGroceryChecked:(week:string,key:string)=>void;
  toggleAlreadyHave:(week:string,key:string)=>void;
  addCustomGrocery:(week:string,label:string)=>void;
  toggleCustomGrocery:(week:string,id:string)=>void;
  removeCustomGrocery:(week:string,id:string)=>void;
  resetWeekChecks:(week:string)=>void;

  setGoals:(patch:Partial<NutritionGoals>)=>void;
  setHouseholdSize:(n:number)=>void;
  setSelectedWeekStart:(week:string)=>void;

  addRecipe:(recipe:Recipe)=>void;
  updateRecipe:(recipe:Recipe)=>void;
  deleteRecipe:(recipeId:string)=>void;
  toggleFavorite:(recipeId:string)=>void;

  resetDemo:()=>void;
};

const C=createContext<Ctx|null>(null);
const defaultGoals:NutritionGoals={enabled:true,kcal:2400,protein:160,carbs:250,fat:75};

function normalizeIngredient(i:any,food?:Food):RecipeIngredient{
  const unit=(i.unit==='ml'||i.unit==='pièce')?i.unit:'g';
  let nutritionAmount:number;
  if(typeof i.nutritionAmount==='number') nutritionAmount=i.nutritionAmount;
  else if(typeof i.grams==='number') nutritionAmount=i.grams;
  else if(unit==='pièce'&&food?.pieceWeight) nutritionAmount=Number(i.amount||0)*food.pieceWeight;
  else nutritionAmount=Number(i.amount||0);
  return {foodId:String(i.foodId),amount:Number(i.amount||0),unit,nutritionAmount};
}

function normalizeRecipe(r:any,foods:Food[]):Recipe{
  return {
    ...r,
    defaultServings:Math.max(1,Number(r.defaultServings||1)),
    timeMinutes:Math.max(0,Number(r.timeMinutes||0)),
    ingredients:(r.ingredients||[]).map((i:any)=>normalizeIngredient(i,foods.find(f=>f.id===i.foodId))),
    steps:Array.isArray(r.steps)?r.steps:[],
    tags:Array.isArray(r.tags)?r.tags:[],
    custom:Boolean(r.custom)
  } as Recipe;
}

function demoPlan():WeekPlan{
  const d=weekDays(mondayOf());
  const p:WeekPlan={};
  const add=(i:number,t:MealType,id:string,cooked:number,consumed=1)=>{
    const k=isoDay(d[i]);
    p[k]={...(p[k]||{}),[t]:{kind:'recipe',recipeId:id,cookedServings:cooked,consumedServings:Math.min(consumed,cooked)}};
  };
  add(0,'breakfast','overnight_oats',1,1);
  add(0,'dinner','chicken_curry',4,1);
  add(1,'lunch','salmon_rice',2,1);
  add(1,'dinner','beef_lasagna',4,1);
  add(2,'breakfast','protein_pancakes',2,1);
  add(2,'dinner','beef_tacos',4,1);
  add(3,'lunch','quinoa_bowl',2,1);
  add(4,'dinner','red_lentil_dahl',4,1);
  add(5,'breakfast','skyr_granola',1,1);
  add(6,'lunch','baked_salmon',4,1);
  return p;
}

function initial():StoreState{
  const current=weekKey(mondayOf());
  return {
    schemaVersion:SCHEMA_VERSION,
    foods:seedFoods as Food[],
    recipes:(seedRecipes as Recipe[]).map(r=>normalizeRecipe(r,seedFoods as Food[])),
    plan:demoPlan(),
    learning:{
      chicken_curry:{
        overallMultiplier:1,
        ingredientMultipliers:{rice_basmati:1.2},
        notes:['Un peu plus de riz'],
        rating:4
      }
    },
    groceryChecked:{},
    alreadyHave:{},
    customGroceries:{},
    favorites:{},
    goals:defaultGoals,
    householdSize:2,
    selectedWeekStart:current,
    loaded:false
  };
}

function migratePlan(plan:any):WeekPlan{
  const out:WeekPlan={};
  Object.entries(plan||{}).forEach(([date,rawDay])=>{
    const day:any={};
    Object.entries((rawDay as any)||{}).forEach(([type,raw])=>{
      if(!raw) return;
      const m:any=raw;
      if(m.kind==='external'){
        day[type]={
          kind:'external',
          name:String(m.name||'Repas externe'),
          kcal:Math.max(0,Number(m.kcal||0)),
          protein:Math.max(0,Number(m.protein||0)),
          carbs:Math.max(0,Number(m.carbs||0)),
          fat:Math.max(0,Number(m.fat||0)),
          note:String(m.note||'')
        };
        return;
      }
      const cooked=Math.max(1,Number(m.cookedServings??m.servings??1));
      const consumed=Math.max(.5,Math.min(cooked,Number(m.consumedServings??1)));
      day[type]={
        kind:'recipe',
        recipeId:String(m.recipeId),
        cookedServings:cooked,
        consumedServings:consumed
      };
    });
    out[date]=day;
  });
  return out;
}

function migrateWeekBooleanState(value:any,currentWeek:string):GroceryWeekState{
  if(!value||typeof value!=='object') return {};
  const vals=Object.values(value);
  const nested=vals.some(v=>v&&typeof v==='object');
  if(nested) return value as GroceryWeekState;
  return {[currentWeek]:value as Record<string,boolean>};
}

function migrateCustomGroceries(value:any,currentWeek:string):Record<string,CustomGrocery[]>{
  if(Array.isArray(value)){
    return {
      [currentWeek]:value.map((x:any,i:number)=>({
        id:`legacy_${i}_${Date.now()}`,
        label:typeof x==='string'?x:String(x?.label||''),
        checked:Boolean(x?.checked)
      })).filter((x:CustomGrocery)=>x.label.trim())
    };
  }
  if(value&&typeof value==='object') return value;
  return {};
}

function hydrate(saved:any):StoreState{
  const base=initial();
  const current=weekKey(mondayOf());
  const custom=(saved?.customRecipes||saved?.recipes?.filter?.((r:any)=>r.custom)||[])
    .map((r:any)=>normalizeRecipe(r,base.foods));
  const byId=new Map<string,Recipe>();
  [...base.recipes,...custom].forEach(r=>byId.set(r.id,r));

  return {
    ...base,
    schemaVersion:SCHEMA_VERSION,
    recipes:[...byId.values()],
    plan:migratePlan(saved?.plan),
    learning:saved?.learning||{},
    groceryChecked:migrateWeekBooleanState(saved?.groceryChecked??saved?.checked,current),
    alreadyHave:migrateWeekBooleanState(saved?.alreadyHave,current),
    customGroceries:migrateCustomGroceries(saved?.customGroceries,current),
    favorites:saved?.favorites||{},
    goals:{...defaultGoals,...(saved?.goals||{})},
    householdSize:Math.max(1,Number(saved?.householdSize||2)),
    selectedWeekStart:weekKey(saved?.selectedWeekStart||current),
    loaded:true
  };
}

export function AppProvider({children}:{children:React.ReactNode}){
  const [s,setS]=useState<StoreState>(initial());

  useEffect(()=>{
    (async()=>{
      try{
        const raw=await AsyncStorage.getItem(STORAGE_KEY);
        if(raw) setS(hydrate(JSON.parse(raw)));
        else setS(x=>({...x,loaded:true}));
      }catch{
        setS(x=>({...x,loaded:true}));
      }
    })();
  },[]);

  useEffect(()=>{
    if(!s.loaded) return;
    const customRecipes=s.recipes.filter(r=>r.custom);
    const payload={
      schemaVersion:SCHEMA_VERSION,
      plan:s.plan,learning:s.learning,groceryChecked:s.groceryChecked,
      alreadyHave:s.alreadyHave,customGroceries:s.customGroceries,
      favorites:s.favorites,goals:s.goals,householdSize:s.householdSize,
      selectedWeekStart:s.selectedWeekStart,customRecipes
    };
    AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(payload)).catch(()=>{});
  },[s]);

  const v=useMemo<Ctx>(()=>({
    ...s,

    setMeal(date,type,recipeId,cookedServings){
      const cooked=Math.max(1,cookedServings??s.householdSize);
      setS(x=>({...x,plan:{...x.plan,[date]:{...(x.plan[date]||{}),[type]:{
        kind:'recipe',recipeId,cookedServings:cooked,consumedServings:1
      }}}}));
    },

    setExternalMeal(date,type,meal){
      const safe={
        kind:'external' as const,
        name:meal.name.trim()||'Repas externe',
        kcal:Math.max(0,Number(meal.kcal||0)),
        protein:Math.max(0,Number(meal.protein||0)),
        carbs:Math.max(0,Number(meal.carbs||0)),
        fat:Math.max(0,Number(meal.fat||0)),
        note:meal.note?.trim()||''
      };
      setS(x=>({...x,plan:{...x.plan,[date]:{...(x.plan[date]||{}),[type]:safe}}}));
    },

    removeMeal(date,type){
      setS(x=>{
        const day={...(x.plan[date]||{})};
        delete day[type];
        return {...x,plan:{...x.plan,[date]:day}};
      });
    },

    changeCookedServings(date,type,delta){
      setS(x=>{
        const meal=x.plan[date]?.[type];
        if(!meal||!isRecipeMeal(meal)) return x;
        const cooked=Math.max(1,meal.cookedServings+delta);
        const consumed=Math.min(meal.consumedServings,cooked);
        return {...x,plan:{...x.plan,[date]:{...(x.plan[date]||{}),[type]:{
          ...meal,cookedServings:cooked,consumedServings:consumed
        }}}};
      });
    },

    changeConsumedServings(date,type,delta){
      setS(x=>{
        const meal=x.plan[date]?.[type];
        if(!meal||!isRecipeMeal(meal)) return x;
        const next=Math.round((meal.consumedServings+delta)*2)/2;
        const consumed=Math.max(.5,Math.min(meal.cookedServings,next));
        return {...x,plan:{...x.plan,[date]:{...(x.plan[date]||{}),[type]:{
          ...meal,consumedServings:consumed
        }}}};
      });
    },

    saveFeedback(recipeId,quantity,rating,note,changes){
      setS(x=>{
        const old=x.learning[recipeId]||{overallMultiplier:1,ingredientMultipliers:{},notes:[]};
        const globalDelta=quantity==='low'?.08:quantity==='high'?-.08:0;
        const overallMultiplier=Math.max(.75,Math.min(1.35,old.overallMultiplier+globalDelta));
        const ingredientMultipliers={...old.ingredientMultipliers};
        Object.entries(changes).forEach(([foodId,delta])=>{
          const next=(ingredientMultipliers[foodId]||1)+delta;
          ingredientMultipliers[foodId]=Math.max(.7,Math.min(1.5,next));
        });
        return {...x,learning:{...x.learning,[recipeId]:{
          overallMultiplier,ingredientMultipliers,rating,
          notes:note.trim()?[...old.notes.slice(-4),note.trim()]:old.notes,
          updatedAt:new Date().toISOString()
        }}};
      });
    },

    resetRecipeLearning(recipeId){
      setS(x=>{const learning={...x.learning};delete learning[recipeId];return {...x,learning};});
    },

    resetIngredientAdjustment(recipeId,foodId){
      setS(x=>{
        const current=x.learning[recipeId]; if(!current) return x;
        const ingredientMultipliers={...current.ingredientMultipliers};
        delete ingredientMultipliers[foodId];
        return {...x,learning:{...x.learning,[recipeId]:{...current,ingredientMultipliers}}};
      });
    },

    toggleGroceryChecked(week,key){
      setS(x=>({...x,groceryChecked:{...x.groceryChecked,[week]:{
        ...(x.groceryChecked[week]||{}),[key]:!(x.groceryChecked[week]?.[key])
      }}}));
    },

    toggleAlreadyHave(week,key){
      setS(x=>({...x,alreadyHave:{...x.alreadyHave,[week]:{
        ...(x.alreadyHave[week]||{}),[key]:!(x.alreadyHave[week]?.[key])
      }}}));
    },

    addCustomGrocery(week,label){
      const clean=label.trim(); if(!clean) return;
      const item:CustomGrocery={id:`manual_${Date.now()}`,label:clean,checked:false};
      setS(x=>({...x,customGroceries:{...x.customGroceries,[week]:[
        ...(x.customGroceries[week]||[]),item
      ]}}));
    },

    toggleCustomGrocery(week,id){
      setS(x=>({...x,customGroceries:{...x.customGroceries,[week]:
        (x.customGroceries[week]||[]).map(i=>i.id===id?{...i,checked:!i.checked}:i)
      }}));
    },

    removeCustomGrocery(week,id){
      setS(x=>({...x,customGroceries:{...x.customGroceries,[week]:
        (x.customGroceries[week]||[]).filter(i=>i.id!==id)
      }}));
    },

    resetWeekChecks(week){
      setS(x=>({...x,
        groceryChecked:{...x.groceryChecked,[week]:{}},
        alreadyHave:{...x.alreadyHave,[week]:{}},
        customGroceries:{...x.customGroceries,[week]:
          (x.customGroceries[week]||[]).map(i=>({...i,checked:false}))
        }
      }));
    },

    setGoals(patch){setS(x=>({...x,goals:{...x.goals,...patch}}));},
    setHouseholdSize(n){setS(x=>({...x,householdSize:Math.max(1,n)}));},
    setSelectedWeekStart(week){setS(x=>({...x,selectedWeekStart:weekKey(week)}));},

    addRecipe(recipe){
      setS(x=>({...x,recipes:[...x.recipes,{...normalizeRecipe(recipe,x.foods),custom:true}]}));
    },

    updateRecipe(recipe){
      setS(x=>({...x,recipes:x.recipes.map(r=>
        r.id===recipe.id?{...normalizeRecipe(recipe,x.foods),custom:true}:r
      )}));
    },

    deleteRecipe(recipeId){
      setS(x=>{
        const plan:WeekPlan={};
        Object.entries(x.plan).forEach(([date,day])=>{
          const next={...(day||{})};
          (['breakfast','lunch','dinner'] as MealType[]).forEach(type=>{
            const meal=next[type];
            if(meal&&isRecipeMeal(meal)&&meal.recipeId===recipeId) delete next[type];
          });
          plan[date]=next;
        });
        const learning={...x.learning}; delete learning[recipeId];
        const favorites={...x.favorites}; delete favorites[recipeId];
        return {...x,recipes:x.recipes.filter(r=>!(r.id===recipeId&&r.custom)),
          plan,learning,favorites};
      });
    },

    toggleFavorite(recipeId){
      setS(x=>({...x,favorites:{...x.favorites,[recipeId]:!x.favorites[recipeId]}}));
    },

    resetDemo(){setS({...initial(),loaded:true});}
  }),[s]);

  return <C.Provider value={v}>{children}</C.Provider>;
}

export function useApp(){
  const value=useContext(C);
  if(!value) throw new Error('AppProvider manquant');
  return value;
}
