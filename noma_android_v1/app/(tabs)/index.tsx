import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';
import React,{useMemo,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {Page} from '@/src/components';
import {IconCircle,PageHeading,ProgressRing,RecipeArtwork,SoftCard} from '@/src/ui';
import {addWeeks,dayShort,formatWeekRange,fromIso,isoDay,mondayOf,weekDays,weekKey} from '@/src/date';
import {macrosForConsumedServings} from '@/src/nutrition';
import {useApp} from '@/src/store';
import {colors,shadow} from '@/src/theme';
import {MealType,isExternalMeal,isRecipeMeal} from '@/src/types';

const slots:[MealType,string,keyof typeof Ionicons.glyphMap,string][]=[
 ['breakfast','Petit-déjeuner','sunny-outline','Commence la journée en douceur.'],
 ['lunch','Déjeuner','sunny-outline','Un repas pour la journée.'],
 ['dinner','Dîner','moon-outline','Termine la journée en toute sérénité.']
];
const zero={kcal:0,protein:0,carbs:0,fat:0};
export default function Week(){
 const {recipes,foods,plan,learning,goals,selectedWeekStart,setSelectedWeekStart}=useApp();
 const start=useMemo(()=>fromIso(selectedWeekStart),[selectedWeekStart]);
 const days=useMemo(()=>weekDays(start),[selectedWeekStart]);
 const today=isoDay(new Date());
 const [selectedIndex,setSelectedIndex]=useState(()=>Math.max(0,days.findIndex(d=>isoDay(d)===today)));
 const selectedDay=days[Math.min(selectedIndex,6)];
 const dateKey=isoDay(selectedDay);
 const day=plan[dateKey]||{};
 function moveWeek(delta:number){
  const next=addWeeks(start,delta);
  setSelectedWeekStart(weekKey(next));
  setSelectedIndex(weekKey(next)===weekKey(mondayOf())?Math.max(0,weekDays(next).findIndex(d=>isoDay(d)===today)):0);
 }
 function goToday(){
  setSelectedWeekStart(weekKey(mondayOf()));
  setSelectedIndex(Math.max(0,weekDays(mondayOf()).findIndex(d=>isoDay(d)===today)));
 }
 const totals=Object.values(day).reduce((acc,meal)=>{
  if(!meal)return acc;
  if(isExternalMeal(meal)){
   acc.kcal+=meal.kcal;acc.protein+=meal.protein;acc.carbs+=meal.carbs;acc.fat+=meal.fat;return acc;
  }
  const recipe=recipes.find(r=>r.id===meal.recipeId);
  if(!recipe)return acc;
  const m=macrosForConsumedServings(recipe,foods,learning[recipe.id],meal.consumedServings);
  acc.kcal+=m.kcal;acc.protein+=m.protein;acc.carbs+=m.carbs;acc.fat+=m.fat;
  return acc;
 },{...zero});
 const percent=goals.kcal?totals.kcal/goals.kcal*100:0;
 const add=(type:MealType)=>router.push({pathname:'/pick-recipe',params:{date:dateKey,meal:type}});
 return <Page contentStyle={{paddingTop:17}}>
  <PageHeading title="Noma" subtitle="Les bons repas font les belles semaines." action={
   <Pressable accessibilityLabel="Revenir à aujourd'hui" onPress={goToday} style={{padding:10}}><Ionicons name="calendar-outline" color={colors.text} size={24}/></Pressable>
  }/>
  <View style={s.weekNav}>
   <IconCircle name="chevron-back" label="Semaine précédente" onPress={()=>moveWeek(-1)}/>
   <Pressable onPress={goToday} accessibilityLabel="Revenir à cette semaine" style={{alignItems:'center',padding:8}}><Text style={s.weekText}>{formatWeekRange(start)}</Text></Pressable>
   <IconCircle name="chevron-forward" label="Semaine suivante" onPress={()=>moveWeek(1)}/>
  </View>
  <View style={s.days}>
   {days.map((d,i)=>{
    const active=i===selectedIndex;
    return <Pressable key={isoDay(d)} accessibilityRole="button" accessibilityState={{selected:active}} onPress={()=>setSelectedIndex(i)} style={[s.day,active&&s.dayOn]}>
     <Text style={[s.dayName,active&&s.white]}>{dayShort[d.getDay()]}</Text>
     <Text style={[s.dayNum,active&&s.white]}>{d.getDate()}</Text>
    </Pressable>;
   })}
  </View>
  {goals.enabled?<SoftCard style={s.macroCard}>
   <ProgressRing percent={percent} size={55}/>
   <View style={{flex:1}}>
    <View style={s.macroTop}><Text style={s.kcal}>{Math.round(totals.kcal).toLocaleString('fr-FR')} <Text style={s.kcalTarget}>/ {goals.kcal.toLocaleString('fr-FR')} kcal</Text></Text>
     <Text style={s.percent}>{Math.round(percent)}%</Text></View>
    <Text numberOfLines={1} style={s.macroCaption}>Prot {Math.round(totals.protein)} g · Gluc {Math.round(totals.carbs)} g · Lip {Math.round(totals.fat)} g</Text>
   </View>
  </SoftCard>:null}
  <View style={{gap:11}}>
   {slots.map(([type,label,icon,hint])=>{
    const meal=day[type];
    const external=meal&&isExternalMeal(meal)?meal:null;
    const recipe=meal&&isRecipeMeal(meal)?recipes.find(r=>r.id===meal.recipeId):undefined;
    const m=recipe&&meal&&isRecipeMeal(meal)?macrosForConsumedServings(recipe,foods,learning[recipe.id],meal.consumedServings):null;
    if(!recipe&&!external)return <SoftCard key={type} style={s.emptyMeal}>
      <View style={{flex:1,paddingRight:8}}>
       <View style={s.mealLabel}><Ionicons name={icon} color={type==='dinner'?'#526B84':'#E7AC22'} size={21}/><Text style={s.mealTitle}>{label}</Text></View>
       <Text style={s.hint}>{hint}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={'Ajouter '+label} onPress={()=>add(type)} style={s.add}>
       <View style={s.plus}><Ionicons name="add" size={20} color="#fff"/></View><Text style={s.addText}>Ajouter un repas</Text>
      </Pressable>
     </SoftCard>;
    return <Pressable key={type} accessibilityRole="button" onPress={()=>router.push({pathname:external?'/external-meal':'/meal-editor',params:{date:dateKey,meal:type}})} style={s.filledMeal}>
      {recipe?<RecipeArtwork title={recipe.title} emoji={recipe.emoji} recipeId={recipe.id} size={76}/>:<View style={s.external}><Ionicons name="restaurant-outline" size={30} color={colors.sageDark}/></View>}
      <View style={{flex:1,minWidth:0}}>
       <View style={s.mealLabel}><Ionicons name={icon} size={17} color={type==='dinner'?'#526B84':'#E7AC22'}/><Text style={s.mealTitle}>{label}</Text></View>
       <Text style={s.recipeName} numberOfLines={2}>{recipe?.title||external?.name}</Text>
       <Text style={s.small}>{recipe&&meal&&isRecipeMeal(meal)?meal.consumedServings+' part · ':''}{goals.enabled?(Math.round(m?.kcal||external?.kcal||0)+' kcal'):''}</Text>
       {goals.enabled?<Text style={s.small} numberOfLines={1}>{Math.round(m?.protein||external?.protein||0)} g prot · {Math.round(m?.carbs||external?.carbs||0)} g gluc · {Math.round(m?.fat||external?.fat||0)} g lip</Text>:null}
      </View><Ionicons name="ellipsis-horizontal" size={21} color={colors.text}/>
     </Pressable>;
   })}
  </View>
 </Page>;
}
const s=StyleSheet.create({
 weekNav:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:13},
 weekText:{fontWeight:'800',fontSize:15,color:colors.text},
 days:{flexDirection:'row',gap:5,justifyContent:'space-between',marginBottom:16},
 day:{flex:1,minWidth:0,height:63,borderRadius:17,backgroundColor:'#fff',borderColor:colors.border,borderWidth:1,alignItems:'center',justifyContent:'center',...shadow},
 dayOn:{backgroundColor:colors.sage,borderColor:colors.sage},
 dayName:{fontSize:11,color:colors.muted},dayNum:{fontSize:18,fontWeight:'800',color:colors.text,marginTop:3},
 white:{color:'#fff'},
 macroCard:{padding:15,flexDirection:'row',alignItems:'center',gap:13,marginBottom:16,backgroundColor:colors.cream},
 macroTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:7},
 kcal:{fontSize:18,fontWeight:'900',color:colors.text},
 kcalTarget:{fontSize:12.5,fontWeight:'500',color:colors.muted},
 percent:{fontWeight:'800',color:colors.sageDark,fontSize:12,backgroundColor:colors.sageSoft,overflow:'hidden',borderRadius:99,paddingHorizontal:8,paddingVertical:5},
 macroCaption:{fontSize:11.5,color:colors.muted,marginTop:5},
 emptyMeal:{padding:15,minHeight:116,flexDirection:'row',alignItems:'center',gap:10},
 mealLabel:{flexDirection:'row',alignItems:'center',gap:7,marginBottom:6},
 mealTitle:{fontSize:14,fontWeight:'900',color:colors.text},
 hint:{fontSize:12,color:colors.muted,lineHeight:18,marginTop:6},
 add:{width:119,minHeight:83,borderRadius:17,borderStyle:'dashed',borderWidth:1,borderColor:'#B7C9B1',backgroundColor:'#FAFCF9',alignItems:'center',justifyContent:'center',padding:8},
 plus:{height:32,width:32,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:colors.paprika,marginBottom:6},
 addText:{fontSize:11,color:colors.sageDark,fontWeight:'700',textAlign:'center'},
 filledMeal:{flexDirection:'row',gap:12,alignItems:'center',padding:11,backgroundColor:'#fff',borderRadius:24,borderWidth:1,borderColor:'#F0F2EC',...shadow},
 external:{height:76,width:76,backgroundColor:colors.sageSoft,borderRadius:17,alignItems:'center',justifyContent:'center'},
 recipeName:{fontSize:13.5,color:colors.text,fontWeight:'700',lineHeight:18},
 small:{fontSize:11.5,color:colors.muted,marginTop:3}
});
