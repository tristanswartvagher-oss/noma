import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';
import React,{useMemo,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {Chip,Page,ScreenTitle} from '@/src/components';
import {perServing} from '@/src/nutrition';
import {useApp} from '@/src/store';
import {normalizeText} from '@/src/text';
import {colors,radius} from '@/src/theme';

const filters=['Toutes','Entrée','Plat','Dessert & Encas','Favoris'] as const;
type Filter=(typeof filters)[number];

export default function Recipes(){
  const {recipes,foods,learning,goals,favorites,toggleFavorite}=useApp();
  const [q,setQ]=useState('');
  const [filter,setFilter]=useState<Filter>('Toutes');

  const list=useMemo(()=>{
    const query=normalizeText(q);
    return recipes.filter(r=>{
      if(filter==='Favoris'&&!favorites[r.id]) return false;
      if(filter!=='Toutes'&&filter!=='Favoris'&&r.category!==filter) return false;
      if(!query) return true;
      const ingredients=r.ingredients.map(i=>foods.find(f=>f.id===i.foodId)?.name||'').join(' ');
      return normalizeText(`${r.title} ${r.tags.join(' ')} ${ingredients}`).includes(query);
    });
  },[recipes,foods,q,filter,favorites]);

  return (
    <Page>
      <ScreenTitle title="Recettes" subtitle="Cherche par nom, tag ou ingrédient."/>

      <View style={s.search}>
        <Ionicons name="search" size={19} color={colors.muted}/>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Ex. poulet, riz, rapide…"
          placeholderTextColor={colors.muted}
          style={{flex:1,color:colors.text}}
        />
        <Pressable accessibilityLabel="Nouvelle recette" onPress={()=>router.push('/new-recipe')}>
          <Ionicons name="add-circle" size={30} color={colors.sage}/>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
        {filters.map(x=><Chip key={x} label={x} active={filter===x} onPress={()=>setFilter(x)}/>)}
      </ScrollView>

      {list.map(r=>{
        const n=perServing(r,foods,learning[r.id]);
        return (
          <Pressable key={r.id} onPress={()=>router.push(`/recipe/${r.id}`)} style={s.card}>
            <View style={s.emoji}><Text style={{fontSize:29}}>{r.emoji}</Text></View>
            <View style={{flex:1}}>
              <Text style={s.name}>{r.title}</Text>
              <Text style={s.meta}>{r.timeMinutes} min · {r.defaultServings} parts{r.custom?' · Perso':''}</Text>
              {goals.enabled?<Text style={s.macro}>{Math.round(n.kcal)} kcal · {Math.round(n.protein)} g prot / part</Text>:null}
            </View>
            <Pressable
              accessibilityLabel={favorites[r.id]?'Retirer des favoris':'Ajouter aux favoris'}
              onPress={e=>{e.stopPropagation();toggleFavorite(r.id);}}
              style={s.favorite}
            >
              <Ionicons name={favorites[r.id]?'heart':'heart-outline'} size={22} color={favorites[r.id]?colors.sage:colors.muted}/>
            </Pressable>
          </Pressable>
        );
      })}

      {list.length===0?<Text style={s.empty}>Aucune recette ne correspond.</Text>:null}
    </Page>
  );
}

const s=StyleSheet.create({
  search:{height:49,borderRadius:999,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:14,marginBottom:12},
  filters:{gap:7,marginBottom:14},
  card:{backgroundColor:'#fff',borderRadius:radius.md,borderWidth:1,borderColor:colors.border,padding:11,flexDirection:'row',alignItems:'center',gap:11,marginBottom:9},
  emoji:{width:60,height:60,borderRadius:18,backgroundColor:colors.beige,alignItems:'center',justifyContent:'center'},
  name:{fontSize:16,fontWeight:'900',color:colors.text},
  meta:{fontSize:12,color:colors.muted,marginTop:3},
  macro:{fontSize:12,color:colors.sageDark,fontWeight:'800',marginTop:4},
  favorite:{width:42,height:42,alignItems:'center',justifyContent:'center'},
  empty:{textAlign:'center',color:colors.muted,marginTop:28}
});
