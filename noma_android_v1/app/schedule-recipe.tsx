import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import React,{useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {Page} from '@/src/components';
import {RecipeArtwork,SoftCard} from '@/src/ui';
import {dayShort,formatWeekRange,fromIso,isoDay,weekDays} from '@/src/date';
import {useApp} from '@/src/store';
import {colors} from '@/src/theme';
import {MealType} from '@/src/types';

const slots:{id:MealType;label:string;icon:keyof typeof Ionicons.glyphMap}[]=[
 {id:'breakfast',label:'Petit-déjeuner',icon:'sunny-outline'},
 {id:'lunch',label:'Déjeuner',icon:'restaurant-outline'},
 {id:'dinner',label:'Dîner',icon:'moon-outline'}
];
export default function ScheduleRecipe(){
 const {id}=useLocalSearchParams<{id:string}>();
 const {recipes,selectedWeekStart,setMeal,plan}=useApp();
 const recipe=recipes.find(r=>r.id===id);
 const days=useMemo(()=>weekDays(fromIso(selectedWeekStart)),[selectedWeekStart]);
 const [index,setIndex]=useState(()=>Math.max(0,days.findIndex(d=>isoDay(d)===isoDay(new Date()))));
 if(!recipe)return <Page><Text>Recette introuvable.</Text></Page>;
 const date=isoDay(days[index]);
 const assign=(type:MealType)=>{setMeal(date,type,recipe.id);router.dismissAll();router.replace('/(tabs)');};
 return <Page>
  <Pressable accessibilityLabel="Retour" onPress={()=>router.back()} style={{paddingVertical:8}}><Ionicons name="chevron-back" size={23} color={colors.text}/></Pressable>
  <Text style={s.title}>Ajouter à la semaine</Text>
  <SoftCard style={s.recipe}><RecipeArtwork title={recipe.title} emoji={recipe.emoji} recipeId={recipe.id} size={80}/><Text style={[s.meal,{flex:1}]}>{recipe.title}</Text></SoftCard>
  <Text style={s.label}>Semaine du {formatWeekRange(fromIso(selectedWeekStart))}</Text>
  <View style={s.days}>{days.map((d,i)=><Pressable key={isoDay(d)} onPress={()=>setIndex(i)} style={[s.day,i===index&&s.active]}><Text style={[s.dayText,i===index&&s.light]}>{dayShort[d.getDay()]}</Text><Text style={[s.num,i===index&&s.light]}>{d.getDate()}</Text></Pressable>)}</View>
  <Text style={s.label}>Choisir le repas</Text>
  {slots.map(slot=><Pressable onPress={()=>assign(slot.id)} key={slot.id} style={s.slot}>
   <Ionicons name={slot.icon} size={22} color={colors.sageDark}/><Text style={[s.meal,{flex:1}]}>{slot.label}</Text>
   {plan[date]?.[slot.id]?<Text style={s.replace}>Remplacer</Text>:null}
   <Ionicons name="chevron-forward" color={colors.muted} size={18}/>
  </Pressable>)}
 </Page>;
}
const s=StyleSheet.create({
 title:{fontSize:29,fontWeight:'900',color:colors.text,marginTop:8,marginBottom:14},
 recipe:{padding:13,flexDirection:'row',alignItems:'center',gap:12},
 meal:{fontSize:15,fontWeight:'800',color:colors.text},
 label:{fontSize:14,color:colors.text,fontWeight:'800',marginTop:24,marginBottom:12},
 days:{flexDirection:'row',gap:5},
 day:{flex:1,height:61,borderWidth:1,borderColor:colors.border,backgroundColor:'#fff',borderRadius:14,alignItems:'center',justifyContent:'center'},
 active:{backgroundColor:colors.paprika,borderColor:colors.paprika},
 dayText:{fontSize:11,color:colors.muted},num:{fontSize:17,color:colors.text,fontWeight:'900'},
 light:{color:'#fff'},
 slot:{backgroundColor:colors.card,borderWidth:1,borderColor:colors.border,borderRadius:18,minHeight:64,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:15,marginBottom:10},
 replace:{color:colors.muted,fontSize:11}
});
