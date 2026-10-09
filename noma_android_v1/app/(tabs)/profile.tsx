import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';
import React from 'react';
import {Pressable,StyleSheet,Switch,Text,View} from 'react-native';
import {Page} from '@/src/components';
import {PageHeading,SoftCard} from '@/src/ui';
import {useApp} from '@/src/store';
import {colors,shadow} from '@/src/theme';

const metrics=[
 ['protein','Protéines','g',colors.red],
 ['carbs','Glucides','g',colors.yellow],
 ['fat','Lipides','g',colors.blue],
 ['kcal','Calories','kcal',colors.sage]
] as const;
export default function Profile(){
 const {goals,setGoals,householdSize,learning}=useApp();
 return <Page>
  <PageHeading title="Profil" subtitle="Tes préférences, tes objectifs, ton Noma." action={
   <Pressable accessibilityLabel="Réglages" onPress={()=>router.push('/profile-settings')} style={{padding:8}}><Ionicons name="settings-outline" color={colors.text} size={24}/></Pressable>
  }/>
  <Pressable style={s.mode} accessibilityRole="button" onPress={()=>setGoals({enabled:!goals.enabled})}>
   <View style={s.leaf}><Ionicons name="leaf-outline" size={26} color={colors.sageDark}/></View>
   <View style={{flex:1}}><Text style={s.mini}>Mon mode nutrition</Text><Text style={s.modeTitle}>{goals.enabled?'Équilibré':'Désactivé'}</Text></View>
   <Switch accessibilityLabel="Afficher les macros" value={goals.enabled} onValueChange={enabled=>setGoals({enabled})} trackColor={{true:colors.sage,false:'#D7DDD5'}} thumbColor="#fff"/>
  </Pressable>
  <View style={s.sectionHead}><Text style={s.section}>Mes objectifs quotidiens</Text><Pressable onPress={()=>router.push('/profile-goals')}><Text style={s.modify}>Modifier</Text></Pressable></View>
  <View style={s.grid}>
   {metrics.map(([key,label,unit,color])=><Pressable onPress={()=>router.push('/profile-goals')} key={key} style={s.metric}>
    <View style={[s.ring,{borderTopColor:color,borderRightColor:color}]}/>
    <View><Text style={s.metricLabel}>{label}</Text><Text style={s.metricValue}>{goals[key].toLocaleString('fr-FR')} {unit}</Text></View>
   </Pressable>)}
  </View>
  <Pressable style={s.row} onPress={()=>router.push('/profile-settings')}>
   <Ionicons name="people-outline" size={23} color={colors.text}/><View style={{flex:1}}><Text style={s.item}>Mon foyer</Text><Text style={s.desc}>{householdSize} personne(s) · portions à préparer</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted}/>
  </Pressable>
  <Pressable style={s.row} onPress={()=>router.push('/profile-settings')}>
   <Ionicons name="sparkles-outline" size={23} color={colors.text}/><View style={{flex:1}}><Text style={s.item}>Noma apprend</Text><Text style={s.desc}>{Object.keys(learning).length} recette(s) adaptée(s)</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted}/>
  </Pressable>
  <Pressable style={s.row} onPress={()=>router.push('/profile-settings')}>
   <Ionicons name="shield-checkmark-outline" size={23} color={colors.text}/><View style={{flex:1}}><Text style={s.item}>Données et réglages</Text><Text style={s.desc}>Base nutritionnelle, version et sauvegarde locale</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted}/>
  </Pressable>
 </Page>;
}
const s=StyleSheet.create({
 mode:{backgroundColor:'#fff',borderRadius:24,flexDirection:'row',alignItems:'center',gap:11,padding:14,borderWidth:1,borderColor:colors.border,...shadow},
 leaf:{height:51,width:51,borderRadius:26,backgroundColor:colors.sageSoft,alignItems:'center',justifyContent:'center'},
 mini:{fontSize:12,color:colors.text},modeTitle:{fontSize:20,fontWeight:'800',color:colors.text,marginTop:2},
 sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:26,marginBottom:13},
 section:{fontSize:17,color:colors.text,fontWeight:'800'},modify:{fontSize:13,color:colors.sageDark,fontWeight:'700'},
 grid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:19},
 metric:{width:'48%',minHeight:84,backgroundColor:'#fff',borderRadius:20,padding:11,flexDirection:'row',alignItems:'center',gap:10,borderWidth:1,borderColor:colors.border,...shadow},
 ring:{height:36,width:36,borderRadius:20,borderWidth:6,borderColor:colors.sageSoft,transform:[{rotate:'-45deg'}]},
 metricLabel:{fontSize:12,color:colors.muted},metricValue:{fontSize:15,fontWeight:'800',color:colors.text,marginTop:3},
 row:{minHeight:77,backgroundColor:'#fff',borderRadius:19,borderWidth:1,borderColor:colors.border,padding:13,flexDirection:'row',alignItems:'center',gap:12,marginBottom:9,...shadow},
 item:{fontSize:14,color:colors.text,fontWeight:'700'},desc:{fontSize:11.5,color:colors.muted,marginTop:4}
});
