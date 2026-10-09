import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=process.argv[2] || process.cwd();
const foods=JSON.parse(fs.readFileSync(path.join(root,'src','seedFoods.json'),'utf8'));
const recipes=JSON.parse(fs.readFileSync(path.join(root,'src','seedRecipes.json'),'utf8'));
const nutritionSrc=fs.readFileSync(path.join(root,'src','nutrition.ts'),'utf8');
const js=ts.transpileModule(nutritionSrc,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};
vm.runInNewContext(js,{exports:mod.exports,module:mod,require,Map,Number,Math,Error}, {filename:'nutrition.js'});
const {ingredientWeightGrams,nutritionAmount,recipeNutrition,perServing,macrosForConsumedServings}=mod.exports;
const byId=new Map(foods.map(f=>[f.id,f]));
assert.equal(foods.length,1000);
assert.equal(byId.size,1000);
assert.equal(recipes.length,60);
assert.equal(recipes.reduce((n,r)=>n+r.steps.length,0),327);
assert.equal(new Set(recipes.map(r=>r.id)).size,60);
assert.equal(new Set(foods.filter(x=>x.ciqualCode).map(x=>x.ciqualCode)).size,997);
const used=new Set();let ingredients=0,ml=0,pieces=0;
for(const food of foods){
 assert.equal(food.referenceQuantity,100,food.id);
 assert.equal(food.referenceUnit,'g',food.id);
 for(const key of ['kcal','protein','carbs','fat','fiber']){
  assert.ok(Number.isFinite(food[key])&&food[key]>=0,food.id+' '+key);
 }
}
for(const recipe of recipes){
 const sum={kcal:0,protein:0,carbs:0,fat:0,fiber:0};
 for(const ing of recipe.ingredients){
  ingredients++;
  used.add(ing.foodId);
  const food=byId.get(ing.foodId);
  assert.ok(food,ing.foodId+' missing');
  const grams=ingredientWeightGrams(ing,food);
  assert.ok(Number.isFinite(grams)&&grams>0,ing.foodId+' conversion invalid');
  assert.equal(nutritionAmount(ing,food),grams);
  assert.ok(food.auditStatus!=='review_mapping',ing.foodId+' reviewed');
  if(ing.unit==='ml'){
    ml++;
    assert.ok(food.densityGPerMl>0,'density '+ing.foodId);
    assert.ok(Math.abs(grams - ing.amount*food.densityGPerMl)<1e-6);
  }
  if(ing.unit==='pièce'){
    pieces++;
    assert.ok(food.pieceWeight>0,'pieceWeight '+ing.foodId);
    assert.ok(Math.abs(grams-ing.amount*food.pieceWeight)<1e-6);
  }
  for(const key of Object.keys(sum))sum[key]+=grams/100*food[key];
 }
 const actual=recipeNutrition(recipe,foods);
 for(const key of Object.keys(sum)){
  assert.ok(Math.abs(actual[key]-sum[key])<1e-6,`${recipe.id} ${key} expected ${sum[key]} got ${actual[key]}`);
  assert.ok(Math.abs(perServing(recipe,foods)[key]-sum[key]/recipe.defaultServings)<1e-6);
  assert.ok(Math.abs(macrosForConsumedServings(recipe,foods,undefined,1.5)[key]-1.5*sum[key]/recipe.defaultServings)<1e-6);
 }
}
assert.equal(used.size,81);
assert.equal(byId.get('black_beans').ciqualCode,null);
assert.equal(byId.get('black_beans').state,'dry');
assert.equal(byId.get('black_beans').auditStatus,'verified_external');
assert.equal(byId.get('black_beans').carbs,46.86);
assert.equal(byId.get('ricotta').ciqualCode,'19585');
assert.equal(byId.get('ricotta').kcalQualifier,'derived');
assert.equal(byId.get('ricotta').kcalSourceValue,null);
const egg=byId.get('egg');
assert.equal(ingredientWeightGrams({amount:2,unit:'pièce',nutritionAmount:999,foodId:'egg'},egg),100);
const oil=byId.get('olive_oil');
assert.ok(Math.abs(ingredientWeightGrams({amount:15,unit:'ml',nutritionAmount:15,foodId:'olive_oil'},oil)-13.77)<1e-9);
assert.ok(Number.isNaN(ingredientWeightGrams({amount:20,unit:'ml',foodId:'rice_basmati'},byId.get('rice_basmati'))));
let errors=0;
try{recipeNutrition({defaultServings:1,ingredients:[{foodId:'rice_basmati',amount:20,unit:'ml'}]},foods)}catch{errors++}
assert.equal(errors,1);
console.log(JSON.stringify({tests:'PASS',foods:foods.length,recipes:recipes.length,steps:327,uniqueRecipeFoods:used.size,ingredients,ml,pieces,ciqualCodes:997}));
