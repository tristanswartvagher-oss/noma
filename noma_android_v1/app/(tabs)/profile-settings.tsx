import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';
import React from 'react';
import {Alert,Pressable,StyleSheet,Switch,Text,View} from 'react-native';
import {Page,Stepper} from '@/src/components';
import {SoftCard} from '@/src/ui';
import {useApp} from '@/src/store';
import {colors} from '@/src/theme';

export default function Settings(){
 const {goals,setGoals,householdSize,setHouseholdSize,learning,foods,resetDemo}=useApp();
 const audited=foods.filter(f=>Boolean(f.auditStatus)).length;
 const review=foods.filter(f=>f.auditStatus==='review_external').length;
 const verified=foods.filter(f=>f.verified).length;
 return <Page>
  <Pressable onPress={()=>router.back()} accessibilityLabel="Retour" style={s.back}><Ionicons name="chevron-back" size={23} color={colors.text}/></Pressable>
  <Text style={s.title}>Préférences & réglages</Text>
  <Text style={s.subtitle}>Personnalise ton expérience Noma.</Text>
  <Text style={s.section}>Mon foyer</Text>
  <SoftCard style={s.card}><View style={s.line}><Ionicons name="people-outline" size={23} color={colors.sageDark}/><View style={{flex:1}}><Text style={s.name}>Portions à préparer</Text><Text style={s.muted}>Par défaut, pour les nouvelles recettes planifiées.</Text></View></View>
   <View style={{alignSelf:'center',marginTop:13}}><Stepper value={householdSize} label="personnes" onMinus={()=>setHouseholdSize(householdSize-1)} onPlus={()=>setHouseholdSize(householdSize+1)}/></View>
  </SoftCard>
  <Text style={s.section}>Nutrition</Text>
  <SoftCard style={s.card}><View style={s.line}><Ionicons name="nutrition-outline" size={23} color={colors.sageDark}/><View style={{flex:1}}><Text style={s.name}>Afficher les macros</Text><Text style={s.muted}>Dans le planning et les recettes.</Text></View><Switch value={goals.enabled} onValueChange={enabled=>setGoals({enabled})} trackColor={{true:colors.sage,false:'#D7DDD5'}}/></View>
   <Pressable onPress={()=>router.push('/profile-goals')} style={[s.line,{marginTop:15}]}><Text style={[s.name,{flex:1}]}>Modifier mes objectifs</Text><Ionicons name="chevron-forward" size={19} color={colors.muted}/></Pressable>
  </SoftCard>
  <Text style={s.section}>Données personnelles</Text>
  <SoftCard style={s.card}><View style={s.line}><Ionicons name="sparkles-outline" size={22} color={colors.sageDark}/><View style={{flex:1}}><Text style={s.name}>Noma apprend</Text><Text style={s.muted}>{Object.keys(learning).length} recette(s) adaptée(s). Les originaux restent intacts.</Text></View></View></SoftCard>
  <Text style={s.section}>À propos</Text>
  <SoftCard style={s.card}><Text style={s.name}>Base nutritionnelle</Text><Text style={s.muted}>{foods.length} aliments · {audited} audités · {review} à rapprocher d'une source · {verified} vérifiés.</Text><Text style={s.muted}>Vérifier la provenance des valeurs avant toute publication.</Text><Text style={[s.muted,{marginTop:11}]}>Noma 1.2.0 · interface rénovée · données V3.2</Text></SoftCard>
  <Pressable onPress={()=>Alert.alert('Réinitialiser Noma ?','Le planning, les recettes personnelles et les ajustements seront supprimés.',[{text:'Annuler',style:'cancel'},{text:'Réinitialiser',style:'destructive',onPress:resetDemo}])} style={s.reset}><Ionicons name="refresh-outline" color={colors.danger} size={18}/><Text style={{color:colors.danger,fontWeight:'700'}}>Réinitialiser les données locales</Text></Pressable>
 </Page>;
}
const s=StyleSheet.create({
 back:{height:42,width:42,borderRadius:22,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',marginBottom:13},
 title:{fontSize:27,fontWeight:'900',color:colors.text,letterSpacing:-.7},subtitle:{color:colors.muted,fontSize:13,marginTop:6,marginBottom:13},
 section:{fontSize:17,fontWeight:'800',color:colors.text,marginTop:15,marginBottom:10},
 card:{padding:16,marginBottom:3},
 line:{flexDirection:'row',alignItems:'center',gap:11},name:{color:colors.text,fontSize:14,fontWeight:'800'},
 muted:{fontSize:12,color:colors.muted,lineHeight:18,marginTop:4},
 reset:{marginTop:25,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,padding:13}
});
