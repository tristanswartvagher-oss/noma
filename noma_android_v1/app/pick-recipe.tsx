import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import React,{useMemo,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {Chip,Page} from '@/src/components';
import {RecipeArtwork} from '@/src/ui';
import {perServing} from '@/src/nutrition';
import {useApp} from '@/src/store';
import {normalizeText} from '@/src/text';
import {colors,shadow} from '@/src/theme';
import {MealType} from '@/src/types';
const options=[['Toutes','Toutes'],['Entrées','Entrée'],['Plats','Plat'],['Desserts','Dessert & Encas'],['Favoris','Favoris']] as const;
type Filter=(typeof options)[number][1];
export default function PickRecipe(){
 const {date,meal}=useLocalSearchParams<{date:string;meal:MealType}>();
 const {recipes,foods,learning,favorites,toggleFavorite,setMeal}=useApp();
 const [q,setQ]=useState('');
 const [filter,setFilter]=useState<Filter>('Toutes');
 const list=useMemo(()=>{
  const query=normalizeText(q);
  return recipes.filter(r=>{
   if(filter==='Favoris'&&!favorites[r.id])return false;
   if(filter!=='Toutes'&&filter!=='Favoris'&&r.category!==filter)return false;
   if(!query)return true;
   const ingredientNames=r.ingredients.map(i=>foods.find(f=>f.id===i.foodId)?.name||'').join(' ');
   return normalizeText(r.title+' '+r.tags.join(' ')+' '+ingredientNames).includes(query);
  });
 },[recipes,foods,q,filter,favorites]);
 const select=(id:string)=>{if(date&&meal){setMeal(date,meal,id);router.back();}};
 return <Page contentStyle={{paddingTop:12}}>
  <View style={s.header}><Text style={s.title}>Ajouter un repas</Text><Pressable accessibilityLabel="Fermer" onPress={()=>router.back()} style={s.close}><Ionicons name="close" size={24} color={colors.text}/></Pressable></View>
  <View style={s.search}><Ionicons name="search-outline" size={21} color={colors.muted}/><TextInput value={q} onChangeText={setQ} placeholder="Rechercher une recette..." placeholderTextColor={colors.muted} style={{flex:1,color:colors.text}}/></View>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
   {options.map(([label,value])=><Chip key={value} label={label} active={filter===value} onPress={()=>setFilter(value)}/>)}
  </ScrollView>
  <Pressable accessibilityRole="button" onPress={()=>router.replace({pathname:'/external-meal',params:{date,meal}})} style={s.external}>
   <Ionicons name="calculator-outline" size={22} color={colors.sageDark}/>
   <View style={{flex:1}}><Text style={s.externalName}>Repas externe</Text><Text style={s.small}>Saisir les macros manuellement, sans IA.</Text></View>
   <Ionicons name="chevron-forward" size={19} color={colors.muted}/>
  </Pressable>
  {list.map(r=>{
   const m=perServing(r,foods,learning[r.id]);
   return <Pressable key={r.id} onPress={()=>select(r.id)} style={s.card}>
    <RecipeArtwork title={r.title} emoji={r.emoji} size={72}/>
    <View style={{flex:1,minWidth:0}}><Text style={s.name} numberOfLines={2}>{r.title}</Text>
     <Text style={s.small}>{r.timeMinutes} min · {r.defaultServings} parts</Text><Text style={s.small}>{Math.round(m.kcal)} kcal · {Math.round(m.protein)} g prot / part</Text>
    </View>
    <Pressable accessibilityLabel="Favori" onPress={e=>{e.stopPropagation();toggleFavorite(r.id);}} style={{padding:8}}>
     <Ionicons name={favorites[r.id]?'heart':'heart-outline'} size={20} color={colors.sageDark}/>
    </Pressable>
   </Pressable>;
  })}
  {!list.length?<Text style={s.none}>Aucune recette correspondante.</Text>:null}
 </Page>;
}
const s=StyleSheet.create({
 header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:18},
 title:{fontSize:28,fontWeight:'900',letterSpacing:-.5,color:colors.text},
 close:{width:42,height:42,alignItems:'center',justifyContent:'center'},
 search:{height:51,backgroundColor:'#fff',borderRadius:26,borderWidth:1,borderColor:colors.border,flexDirection:'row',alignItems:'center',gap:9,paddingHorizontal:14,marginBottom:12},
 filters:{gap:8,paddingBottom:14},
 external:{flexDirection:'row',alignItems:'center',gap:12,padding:12,backgroundColor:colors.sageSoft,borderRadius:19,marginBottom:14},
 externalName:{fontSize:13,color:colors.text,fontWeight:'800'},
 small:{fontSize:11.5,color:colors.muted,marginTop:4},
 card:{flexDirection:'row',alignItems:'center',gap:11,backgroundColor:'#fff',borderRadius:20,borderWidth:1,borderColor:colors.border,padding:9,marginBottom:9,...shadow},
 name:{fontSize:14,color:colors.text,fontWeight:'800',lineHeight:20},
 none:{textAlign:'center',marginTop:22,color:colors.muted}
});
