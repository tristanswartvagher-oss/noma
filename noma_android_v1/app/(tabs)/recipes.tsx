import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';
import React,{useMemo,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {Chip,Page} from '@/src/components';
import {PageHeading,RecipeArtwork,Eyebrow} from '@/src/ui';
import {perServing} from '@/src/nutrition';
import {useApp} from '@/src/store';
import {normalizeText} from '@/src/text';
import {colors,shadow} from '@/src/theme';

const filters=[['Toutes','Toutes'],['Entrées','Entrée'],['Plats','Plat'],['Desserts & encas','Dessert & Encas'],['Favoris','Favoris']] as const;
type Filter=(typeof filters)[number][1];
export default function Recipes(){
 const {recipes,foods,learning,goals,favorites,toggleFavorite}=useApp();
 const [q,setQ]=useState('');
 const [filter,setFilter]=useState<Filter>('Toutes');
 const list=useMemo(()=>{
  const query=normalizeText(q);
  return recipes.filter(r=>{
   if(filter==='Favoris'&&!favorites[r.id])return false;
   if(filter!=='Toutes'&&filter!=='Favoris'&&r.category!==filter)return false;
   if(!query)return true;
   return normalizeText(r.title+' '+r.tags.join(' ')+' '+r.ingredients.map(i=>foods.find(f=>f.id===i.foodId)?.name||'').join(' ')).includes(query);
  });
 },[recipes,foods,q,filter,favorites]);
 return <Page>
  <PageHeading title="Recettes" subtitle="Des idées à cuisiner, à partager et à savourer." action={<Pressable accessibilityLabel="Créer une recette" onPress={()=>router.push('/new-recipe')} style={s.addIcon}><Ionicons name="add" size={23} color={colors.sageDark}/></Pressable>}/>
  <View style={s.search}><Ionicons name="search-outline" size={21} color={colors.text}/><TextInput value={q} onChangeText={setQ} placeholder="Rechercher une recette..." placeholderTextColor={colors.muted} style={{flex:1,color:colors.text,fontSize:13.5}} clearButtonMode="while-editing"/></View>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
   {filters.map(([label,value])=><Chip key={value} label={label} active={filter===value} onPress={()=>setFilter(value)}/>)}
  </ScrollView>
  <View style={s.catalogHead}><Eyebrow>Le plaisir est dans l’assiette</Eyebrow><Text style={s.total}>{list.length} recette{list.length>1?'s':''}</Text></View>
  {list.map(r=>{
   const n=perServing(r,foods,learning[r.id]);
   return <Pressable accessibilityRole="button" key={r.id} onPress={()=>router.push({pathname:'/recipe/[id]',params:{id:r.id}})} style={s.card}>
    <RecipeArtwork title={r.title} emoji={r.emoji} recipeId={r.id} size={92}/>
    <View style={{flex:1,minWidth:0}}><Text style={s.name} numberOfLines={2}>{r.title}</Text><Text style={s.category}>{r.category==='Dessert & Encas'?'DESSERT / ENCAS':r.category.toUpperCase()}</Text>
     <Text style={s.meta}>{r.timeMinutes} min · {r.defaultServings} parts{r.custom?' · Perso':''}</Text>
     {goals.enabled?<Text style={s.macro} numberOfLines={1}>{Math.round(n.kcal)} kcal · {Math.round(n.protein)} g prot / part</Text>:null}
    </View>
    <Pressable accessibilityLabel={favorites[r.id]?'Retirer des favoris':'Ajouter aux favoris'} onPress={e=>{e.stopPropagation();toggleFavorite(r.id);}} style={s.fav}>
     <Ionicons name={favorites[r.id]?'heart':'heart-outline'} color={favorites[r.id]?colors.sageDark:colors.text} size={22}/>
    </Pressable>
   </Pressable>;
  })}
  {!list.length?<Text style={s.empty}>Aucune recette trouvée.</Text>:null}
 </Page>;
}
const s=StyleSheet.create({
 addIcon:{width:48,height:48,borderRadius:24,backgroundColor:colors.lemon,alignItems:'center',justifyContent:'center'},
 search:{height:54,borderRadius:27,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:14,marginBottom:13,...shadow},
 filters:{gap:7,paddingBottom:16},
 catalogHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12,marginTop:4},
 total:{fontSize:11.5,color:colors.muted,fontWeight:'700'},
 category:{fontSize:10,color:colors.paprika,fontWeight:'900',letterSpacing:.4,marginTop:5},
 card:{flexDirection:'row',gap:12,alignItems:'center',padding:10,backgroundColor:colors.card,borderRadius:24,borderWidth:1,borderColor:'#F0F2EC',marginBottom:10,...shadow},
 name:{fontSize:15,fontWeight:'900',color:colors.text,lineHeight:20},
 meta:{fontSize:11.5,color:colors.muted,marginTop:5},
 macro:{fontSize:11.5,color:colors.muted,marginTop:5},
 fav:{width:48,minHeight:48,alignItems:'center',justifyContent:'center'},
 empty:{textAlign:'center',marginTop:40,color:colors.muted}
});
