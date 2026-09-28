import AsyncStorage from '@react-native-async-storage/async-storage';
import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import seedFoods from './seedFoods.json';
import seedRecipes from './seedRecipes.json';
import {isoDay,mondayOf,weekDays} from './date';
import {Food,MealType,NutritionGoals,PlannedMeal,Recipe,RecipeLearning,WeekPlan} from './types';

type StoreState={
  foods:Food[]; recipes:Recipe[]; plan:WeekPlan; learning:Record<string,RecipeLearning>;
  checked:Record<string,boolean>; alreadyHave:Record<string,boolean>;
  goals:NutritionGoals; householdSize:number; customGroceries:string[]; loaded:boolean;
};
type Ctx=StoreState&{
  setMeal:(date:string,type:MealType,recipeId:string,servings?:number)=>void;
  removeMeal:(date:string,type:MealType)=>void;
  changeServings:(date:string,type:MealType,delta:number)=>void;
  saveFeedback:(recipeId:string,quantity:'low'|'perfect'|'high',rating:number,note:string,changes:Record<string,number>)=>void;
  toggleChecked:(key:string)=>void; toggleAlreadyHave:(key:string)=>void;
  setGoals:(patch:Partial<NutritionGoals>)=>void; setHouseholdSize:(n:number)=>void;
  addCustomGrocery:(s:string)=>void; removeCustomGrocery:(s:string)=>void;
  addRecipe:(r:Recipe)=>void; resetDemo:()=>void;
};
const C=createContext<Ctx|null>(null); const KEY='noma-v1-state';

const defaultGoals:NutritionGoals={enabled:true,kcal:2400,protein:160,carbs:250,fat:75};

function demoPlan():WeekPlan{
  const d=weekDays(mondayOf()); const p:WeekPlan={};
  const add=(i:number,t:MealType,id:string,s:number)=>{const k=isoDay(d[i]);p[k]={...(p[k]||{}),[t]:{recipeId:id,servings:s}}};
  add(0,'breakfast','overnight_oats',1); add(0,'dinner','chicken_curry',4);
  add(1,'lunch','salmon_rice',2); add(1,'dinner','beef_lasagna',4);
  add(2,'breakfast','protein_pancakes',2); add(2,'dinner','beef_tacos',4);
  add(3,'lunch','quinoa_bowl',2); add(4,'dinner','red_lentil_dahl',4);
  add(5,'breakfast','skyr_granola',1); add(6,'lunch','baked_salmon',4);
  return p;
}
function initial():StoreState{
  return {
    foods:seedFoods as Food[],recipes:seedRecipes as Recipe[],plan:demoPlan(),
    learning:{chicken_curry:{overallMultiplier:1,ingredientMultipliers:{rice_basmati:1.2},notes:['Un peu plus de riz'],rating:4}},
    checked:{},alreadyHave:{},goals:defaultGoals,householdSize:2,customGroceries:[],loaded:false
  };
}
export function AppProvider({children}:{children:React.ReactNode}){
  const [s,setS]=useState<StoreState>(initial());
  useEffect(()=>{(async()=>{try{const raw=await AsyncStorage.getItem(KEY);if(raw){const saved=JSON.parse(raw);setS(x=>({...x,...saved,foods:seedFoods as Food[],recipes:[...(seedRecipes as Recipe[]),...(saved.customRecipes||[])],loaded:true}))}else setS(x=>({...x,loaded:true}))}catch{setS(x=>({...x,loaded:true}))}})()},[]);
  useEffect(()=>{if(!s.loaded)return;const customRecipes=s.recipes.filter(r=>r.custom);const payload={plan:s.plan,learning:s.learning,checked:s.checked,alreadyHave:s.alreadyHave,goals:s.goals,householdSize:s.householdSize,customGroceries:s.customGroceries,customRecipes};AsyncStorage.setItem(KEY,JSON.stringify(payload)).catch(()=>{})},[s]);
  const v=useMemo<Ctx>(()=>({...s,
    setMeal(date,type,recipeId,servings){const r=s.recipes.find(x=>x.id===recipeId);const n=servings||Math.max(1,Math.min(r?.defaultServings||s.householdSize,s.householdSize));setS(x=>({...x,plan:{...x.plan,[date]:{...(x.plan[date]||{}),[type]:{recipeId,servings:n}}}}))},
    removeMeal(date,type){setS(x=>{const day={...(x.plan[date]||{})};delete day[type];return {...x,plan:{...x.plan,[date]:day}}})},
    changeServings(date,type,delta){setS(x=>{const m=x.plan[date]?.[type];if(!m)return x;return {...x,plan:{...x.plan,[date]:{...(x.plan[date]||{}),[type]:{...m,servings:Math.max(1,m.servings+delta)}}}}})},
    saveFeedback(recipeId, quantity, rating, note, changes) {
  setS(x => {
    const old = x.learning[recipeId] || {
      overallMultiplier: 1,
      ingredientMultipliers: {},
      notes: [],
    };

    const d =
      quantity === 'low'
        ? 0.08
        : quantity === 'high'
        ? -0.08
        : 0;

    const overallMultiplier = Math.max(
      0.75,
      Math.min(1.35, old.overallMultiplier + d)
    );

    const ingredientMultipliers = {
      ...old.ingredientMultipliers,
    };

    Object.entries(changes).forEach(([id, c]) => {
      ingredientMultipliers[id] = Math.max(
        0.7,
        Math.min(
          1.5,
          (ingredientMultipliers[id] || 1) + c
        )
      );
    });

    return {
      ...x,
      learning: {
        ...x.learning,
        [recipeId]: {
          overallMultiplier,
          ingredientMultipliers,
          rating,
          notes: note.trim()
            ? [...old.notes.slice(-4), note.trim()]
            : old.notes,
        },
      },
    };
  });
},
    toggleChecked(key){setS(x=>({...x,checked:{...x.checked,[key]:!x.checked[key]}}))},
    toggleAlreadyHave(key){setS(x=>({...x,alreadyHave:{...x.alreadyHave,[key]:!x.alreadyHave[key]}}))},
    setGoals(patch){setS(x=>({...x,goals:{...x.goals,...patch}}))},
    setHouseholdSize(n){setS(x=>({...x,householdSize:Math.max(1,n)}))},
    addCustomGrocery(t){const q=t.trim();if(q)setS(x=>({...x,customGroceries:[...x.customGroceries,q]}))},
    removeCustomGrocery(t){setS(x=>({...x,customGroceries:x.customGroceries.filter(q=>q!==t)}))},
    addRecipe(r){setS(x=>({...x,recipes:[...x.recipes,{...r,custom:true}]}))},
    resetDemo(){setS({...initial(),loaded:true})}
  }),[s]);
  return <C.Provider value={v}>{children}</C.Provider>
}
export function useApp(){const v=useContext(C);if(!v)throw new Error('AppProvider manquant');return v}
