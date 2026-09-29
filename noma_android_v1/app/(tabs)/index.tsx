import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';
import React,{useMemo,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {Page,ScreenTitle} from '@/src/components';
import {addWeeks,dayLong,dayShort,formatWeekRange,fromIso,isoDay,mondayOf,monthShort,weekDays,weekKey} from '@/src/date';
import {macrosForConsumedServings} from '@/src/nutrition';
import {useApp} from '@/src/store';
import {colors,radius} from '@/src/theme';
import {MealType,isExternalMeal,isRecipeMeal} from '@/src/types';

const slots:[MealType,string,keyof typeof Ionicons.glyphMap][]=[
  ['breakfast','Petit-déj','cafe-outline'],
  ['lunch','Déjeuner','sunny-outline'],
  ['dinner','Dîner','moon-outline']
];

export default function Week(){
  const {recipes,foods,plan,learning,goals,selectedWeekStart,setSelectedWeekStart}=useApp();

  const start=useMemo(()=>fromIso(selectedWeekStart),[selectedWeekStart]);
  const days=useMemo(()=>weekDays(start),[selectedWeekStart]);
  const today=isoDay(new Date());
  const initialIndex=Math.max(0,days.findIndex(d=>isoDay(d)===today));
  const [selectedIndex,setSelectedIndex]=useState(initialIndex);
  const selectedDay=days[Math.min(selectedIndex,6)];
  const dateKey=isoDay(selectedDay);
  const day=plan[dateKey]||{};

  function moveWeek(delta:number){
    const next=addWeeks(start,delta);
    setSelectedWeekStart(weekKey(next));
    const idx=weekKey(next)===weekKey(mondayOf())
      ?Math.max(0,weekDays(next).findIndex(d=>isoDay(d)===today)):0;
    setSelectedIndex(idx);
  }

  function goToday(){
    const current=mondayOf();
    setSelectedWeekStart(weekKey(current));
    setSelectedIndex(Math.max(0,weekDays(current).findIndex(d=>isoDay(d)===today)));
  }

  const totals=Object.values(day).reduce((acc,meal)=>{
    if(!meal) return acc;

    if(isExternalMeal(meal)){
      acc.kcal+=meal.kcal;
      acc.protein+=meal.protein;
      acc.carbs+=meal.carbs;
      acc.fat+=meal.fat;
      return acc;
    }

    const recipe=recipes.find(r=>r.id===meal.recipeId);
    if(!recipe) return acc;
    const m=macrosForConsumedServings(recipe,foods,learning[recipe.id],meal.consumedServings);
    acc.kcal+=m.kcal; acc.protein+=m.protein; acc.carbs+=m.carbs; acc.fat+=m.fat;
    return acc;
  },{kcal:0,protein:0,carbs:0,fat:0});

  return (
    <Page>
      <ScreenTitle title="Noma" subtitle="Ta semaine, tes quantités, tes repères."/>

      <View style={s.weekNav}>
        <Pressable accessibilityLabel="Semaine précédente" onPress={()=>moveWeek(-1)} style={s.navButton}>
          <Ionicons name="chevron-back" size={20} color={colors.text}/>
        </Pressable>
        <Pressable onPress={goToday} style={s.weekCenter}>
          <Text style={s.weekText}>{formatWeekRange(start)}</Text>
          <Text style={s.todayHint}>{weekKey(start)===weekKey(mondayOf())?'Cette semaine':'Revenir à aujourd’hui'}</Text>
        </Pressable>
        <Pressable accessibilityLabel="Semaine suivante" onPress={()=>moveWeek(1)} style={s.navButton}>
          <Ionicons name="chevron-forward" size={20} color={colors.text}/>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.days}>
        {days.map((d,i)=>{
          const active=i===selectedIndex;
          const count=Object.keys(plan[isoDay(d)]||{}).length;
          return (
            <Pressable key={isoDay(d)} onPress={()=>setSelectedIndex(i)} style={[s.day,active&&s.dayOn]}>
              <Text style={[s.dayName,active&&s.white]}>{dayShort[d.getDay()]}</Text>
              <Text style={[s.dayNum,active&&s.white]}>{d.getDate()}</Text>
              <View style={[s.dot,count>0&&{backgroundColor:active?'#DCE6D7':colors.sage}]}/>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={s.head}>
        <View style={{flex:1}}>
          <Text style={s.h2}>{dayLong[selectedDay.getDay()]} {selectedDay.getDate()} {monthShort[selectedDay.getMonth()]}</Text>
          <Text style={s.muted}>Macros = ce que tu manges · courses = ce que tu cuisines.</Text>
        </View>
        <View style={s.counter}><Text style={s.counterT}>{Object.keys(day).length}/3</Text></View>
      </View>

      {goals.enabled&&(
        <View style={s.macroCard}>
          <View style={s.macroHead}>
            <Text style={s.macroBig}>{Math.round(totals.kcal)} <Text style={s.macroSmall}>/ {goals.kcal} kcal</Text></Text>
            <Text style={s.macroRight}>{goals.kcal?Math.round((totals.kcal/goals.kcal)*100):0}%</Text>
          </View>
          <Text style={s.muted}>{Math.round(totals.protein)} g prot · {Math.round(totals.carbs)} g gluc · {Math.round(totals.fat)} g lip</Text>
          <View style={s.progress}>
            <View style={[s.progressFill,{width:`${Math.min(100,goals.kcal?totals.kcal/goals.kcal*100:0)}%`}]}/>
          </View>
        </View>
      )}

      <View style={{gap:11}}>
        {slots.map(([type,label,icon])=>{
          const meal=day[type];

          if(meal&&isExternalMeal(meal)){
            return (
              <View key={type} style={s.meal}>
                <View style={s.mealLabel}>
                  <Ionicons name={icon} size={18} color={colors.sageDark}/>
                  <Text style={s.mealLabelT}>{label}</Text>
                </View>
                <Pressable
                  style={s.mealBody}
                  onPress={()=>router.push({pathname:'/external-meal',params:{date:dateKey,meal:type}})}
                >
                  <View style={[s.emoji,{backgroundColor:colors.sageSoft}]}>
                    <Ionicons name="briefcase-outline" size={25} color={colors.sageDark}/>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={s.recipe}>{meal.name}</Text>
                    <Text style={s.meta}>Repas externe · saisie manuelle</Text>
                    {goals.enabled?<Text style={s.macroLine}>{Math.round(meal.kcal)} kcal · {Math.round(meal.protein)} g prot</Text>:null}
                  </View>
                  <Ionicons name="ellipsis-horizontal-circle" size={25} color={colors.sage}/>
                </Pressable>
              </View>
            );
          }

          const recipe=meal&&isRecipeMeal(meal)?recipes.find(r=>r.id===meal.recipeId):undefined;
          const mealMacros=recipe&&meal&&isRecipeMeal(meal)
            ?macrosForConsumedServings(recipe,foods,learning[recipe.id],meal.consumedServings):null;

          return (
            <View key={type} style={s.meal}>
              <View style={s.mealLabel}>
                <Ionicons name={icon} size={18} color={colors.sageDark}/>
                <Text style={s.mealLabelT}>{label}</Text>
              </View>

              {recipe&&meal&&isRecipeMeal(meal)?(
                <Pressable
                  style={s.mealBody}
                  onPress={()=>router.push({pathname:'/meal-editor',params:{date:dateKey,meal:type}})}
                >
                  <View style={s.emoji}><Text style={{fontSize:27}}>{recipe.emoji}</Text></View>
                  <View style={{flex:1}}>
                    <Text style={s.recipe}>{recipe.title}</Text>
                    <Text style={s.meta}>Préparer {meal.cookedServings} · Moi {meal.consumedServings}</Text>
                    {goals.enabled&&mealMacros?<Text style={s.macroLine}>{Math.round(mealMacros.kcal)} kcal · {Math.round(mealMacros.protein)} g prot</Text>:null}
                  </View>
                  <Ionicons name="ellipsis-horizontal-circle" size={25} color={colors.sage}/>
                </Pressable>
              ):(
                <Pressable
                  style={s.add}
                  onPress={()=>router.push({pathname:'/pick-recipe',params:{date:dateKey,meal:type}})}
                >
                  <Ionicons name="add" size={20} color={colors.sageDark}/>
                  <Text style={s.addT}>Ajouter {label.toLowerCase()}</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </Page>
  );
}

const s=StyleSheet.create({
  weekNav:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14},
  navButton:{width:44,height:44,borderRadius:22,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'},
  weekCenter:{alignItems:'center',paddingHorizontal:8},
  weekText:{fontWeight:'900',fontSize:15,color:colors.text},
  todayHint:{fontSize:11,color:colors.muted,marginTop:2},
  days:{gap:8,paddingBottom:18},
  day:{width:54,height:76,borderRadius:20,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'},
  dayOn:{backgroundColor:colors.sage,borderColor:colors.sage},
  dayName:{fontSize:12,fontWeight:'800',color:colors.muted},
  dayNum:{fontSize:20,fontWeight:'900',color:colors.text,marginTop:2},
  white:{color:'#fff'},
  dot:{width:5,height:5,borderRadius:3,marginTop:6},
  head:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12,gap:10},
  h2:{fontSize:21,fontWeight:'900',color:colors.text},
  muted:{color:colors.muted,fontSize:12.5,marginTop:3,lineHeight:18},
  counter:{backgroundColor:colors.sageSoft,paddingVertical:7,paddingHorizontal:12,borderRadius:999},
  counterT:{color:colors.sageDark,fontWeight:'900'},
  macroCard:{backgroundColor:colors.sageSoft,borderRadius:radius.lg,padding:15,marginBottom:12},
  macroHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  macroBig:{fontSize:22,fontWeight:'900',color:colors.text},
  macroSmall:{fontSize:13,color:colors.muted,fontWeight:'700'},
  macroRight:{fontSize:12,color:colors.sageDark,fontWeight:'900'},
  progress:{height:6,backgroundColor:'#D8E2D3',borderRadius:999,overflow:'hidden',marginTop:10},
  progressFill:{height:6,backgroundColor:colors.sage},
  meal:{backgroundColor:'#fff',borderRadius:radius.lg,padding:14,borderWidth:1,borderColor:colors.border},
  mealLabel:{flexDirection:'row',alignItems:'center',gap:7,marginBottom:10},
  mealLabelT:{fontWeight:'900',fontSize:14,color:colors.text},
  mealBody:{flexDirection:'row',alignItems:'center',gap:11},
  emoji:{width:53,height:53,borderRadius:17,backgroundColor:colors.beige,alignItems:'center',justifyContent:'center'},
  recipe:{fontSize:17,fontWeight:'900',color:colors.text},
  meta:{fontSize:12.5,color:colors.muted,marginTop:3},
  macroLine:{fontSize:12,color:colors.sageDark,fontWeight:'800',marginTop:4},
  add:{borderWidth:1.2,borderStyle:'dashed',borderColor:'#CAD5C7',backgroundColor:'#FAFCF9',borderRadius:18,padding:13,flexDirection:'row',gap:8,alignItems:'center'},
  addT:{color:colors.sageDark,fontWeight:'900'}
});
