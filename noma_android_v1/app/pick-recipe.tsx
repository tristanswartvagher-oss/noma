import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import React,{useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {Page} from '@/src/components';
import {useApp} from '@/src/store';
import {normalizeText} from '@/src/text';
import {colors,radius} from '@/src/theme';
import {MealType} from '@/src/types';

export default function PickRecipe(){
  const {date,meal}=useLocalSearchParams<{date:string;meal:MealType}>();
  const {recipes,foods,setMeal}=useApp();
  const [q,setQ]=useState('');

  const list=useMemo(()=>{
    const query=normalizeText(q);
    return recipes.filter(r=>{
      if(!query) return true;
      const ingredientNames=r.ingredients
        .map(i=>foods.find(f=>f.id===i.foodId)?.name||'')
        .join(' ');
      return normalizeText(`${r.title} ${r.tags.join(' ')} ${ingredientNames}`).includes(query);
    });
  },[recipes,foods,q]);

  return (
    <Page>
      <Text onPress={()=>router.back()} style={s.close}>Fermer</Text>
      <Text style={s.title}>Ajouter un repas</Text>

      <Pressable
        style={s.external}
        onPress={()=>router.replace({pathname:'/external-meal',params:{date,meal}})}
      >
        <View style={s.externalIcon}>
          <Ionicons name="calculator-outline" size={24} color={colors.sageDark}/>
        </View>
        <View style={{flex:1}}>
          <Text style={s.externalTitle}>Repas externe</Text>
          <Text style={s.meta}>Saisir kcal, protéines, glucides et lipides. Sans IA.</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.muted}/>
      </Pressable>

      <Text style={s.section}>Ou choisir une recette</Text>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Nom, tag ou ingrédient"
        placeholderTextColor={colors.muted}
        style={s.search}
      />
      {list.map(r=>(
        <Pressable
          key={r.id}
          style={s.card}
          onPress={()=>{setMeal(date,meal,r.id);router.back();}}
        >
          <View style={s.emoji}><Text style={{fontSize:28}}>{r.emoji}</Text></View>
          <View style={{flex:1}}>
            <Text style={s.name}>{r.title}</Text>
            <Text style={s.meta}>{r.category} · {r.timeMinutes} min</Text>
          </View>
        </Pressable>
      ))}
    </Page>
  );
}

const s=StyleSheet.create({
  close:{alignSelf:'flex-end',fontWeight:'900',color:colors.sageDark,marginBottom:14},
  title:{fontFamily:'Georgia',fontSize:34,fontWeight:'700',color:colors.text,marginBottom:14},
  external:{flexDirection:'row',alignItems:'center',gap:11,backgroundColor:colors.sageSoft,borderRadius:radius.lg,padding:14,marginBottom:18},
  externalIcon:{width:48,height:48,borderRadius:16,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},
  externalTitle:{fontSize:16,fontWeight:'900',color:colors.text},
  section:{fontSize:13,fontWeight:'900',color:colors.muted,marginBottom:8,marginLeft:4},
  search:{height:48,borderRadius:999,borderWidth:1,borderColor:colors.border,backgroundColor:'#fff',paddingHorizontal:14,color:colors.text,marginBottom:12},
  card:{flexDirection:'row',gap:11,alignItems:'center',backgroundColor:'#fff',borderRadius:radius.md,borderWidth:1,borderColor:colors.border,padding:11,marginBottom:9},
  emoji:{width:58,height:58,borderRadius:18,backgroundColor:colors.beige,alignItems:'center',justifyContent:'center'},
  name:{fontSize:16,fontWeight:'900',color:colors.text},
  meta:{fontSize:12,color:colors.muted,marginTop:3,lineHeight:17}
});
