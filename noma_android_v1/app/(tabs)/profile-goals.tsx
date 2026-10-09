import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';
import React,{useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {Page} from '@/src/components';
import {useApp} from '@/src/store';
import {colors,shadow} from '@/src/theme';
import {SoftCard} from '@/src/ui';

type Key='kcal'|'protein'|'carbs'|'fat';
const fields:{key:Key;label:string;unit:string;min:number;max:number;color:string;icon:keyof typeof Ionicons.glyphMap}[]=[
 {key:'kcal',label:'Calories',unit:'kcal',min:1200,max:3200,color:colors.sage,icon:'flame-outline'},
 {key:'protein',label:'Protéines',unit:'g',min:50,max:200,color:colors.red,icon:'barbell-outline'},
 {key:'carbs',label:'Glucides',unit:'g',min:100,max:400,color:colors.yellow,icon:'nutrition-outline'},
 {key:'fat',label:'Lipides',unit:'g',min:30,max:150,color:colors.blue,icon:'water-outline'}
];
function GoalInput({field,value,save}:{field:(typeof fields)[number];value:number;save:(value:number)=>void}){
 const [draft,setDraft]=useState(String(value));
 const percent=Math.max(0,Math.min(100,(value-field.min)/(field.max-field.min)*100));
 return <SoftCard style={s.card}>
  <View style={s.cardHead}>
   <View style={[s.symbol,{backgroundColor:colors.sageSoft}]}><Ionicons name={field.icon} color={field.color} size={21}/></View>
   <Text style={s.name}>{field.label}</Text>
   <TextInput keyboardType="numeric" accessibilityLabel={'Objectif '+field.label} selectTextOnFocus value={draft} onChangeText={setDraft}
    onBlur={()=>{const n=Math.round(Number(draft.replace(',','.')));if(Number.isFinite(n)&&n>0)save(n);else setDraft(String(value));}}
    style={s.value}/>
   <Text style={s.unit}>{field.unit}</Text>
  </View>
  <View style={s.track}><View style={[s.fill,{backgroundColor:field.color,width:`${percent}%` as `${number}%`}]}/></View>
  <View style={s.range}><Text style={s.muted}>{field.min.toLocaleString('fr-FR')}</Text><Text style={s.muted}>{field.max.toLocaleString('fr-FR')}</Text></View>
 </SoftCard>;
}
export default function Goals(){
 const {goals,setGoals}=useApp();
 return <Page>
  <Pressable accessibilityLabel="Retour" onPress={()=>router.back()} style={s.back}><Ionicons name="chevron-back" size={23} color={colors.text}/></Pressable>
  <Text style={s.title}>Objectifs nutritionnels</Text>
  <Text style={s.subtitle}>Définis tes apports quotidiens selon tes besoins.</Text>
  <View style={s.tip}><Ionicons name="information-circle-outline" size={23} color={colors.sageDark}/><Text style={{flex:1,color:colors.sageDark,fontSize:12,lineHeight:18}}>Ces objectifs sont modifiables à tout moment. Ils ne constituent pas une prescription médicale.</Text></View>
  {fields.map(field=><GoalInput key={field.key} field={field} value={goals[field.key]} save={value=>setGoals({[field.key]:value})}/>)}
  <Text style={s.footer}>Les valeurs enregistrées sont utilisées dans la semaine et dans les recettes.</Text>
 </Page>;
}
const s=StyleSheet.create({
 back:{width:41,height:41,borderRadius:21,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',marginBottom:12},
 title:{fontSize:27,fontWeight:'900',color:colors.text,letterSpacing:-.7},subtitle:{fontSize:13,color:colors.muted,marginTop:6,marginBottom:17},
 tip:{flexDirection:'row',alignItems:'center',gap:11,backgroundColor:colors.sageSoft,borderRadius:19,padding:15,marginBottom:15},
 card:{padding:16,marginBottom:10},cardHead:{flexDirection:'row',alignItems:'center',gap:8},
 symbol:{width:38,height:38,borderRadius:19,alignItems:'center',justifyContent:'center'},
 name:{flex:1,fontSize:14,fontWeight:'800',color:colors.text},
 value:{minWidth:60,maxWidth:94,textAlign:'right',color:colors.text,fontSize:17,fontWeight:'900',paddingVertical:6,paddingHorizontal:0},
 unit:{color:colors.muted,fontSize:13},
 track:{height:6,borderRadius:8,backgroundColor:'#E6E9E6',marginTop:15,overflow:'hidden'},
 fill:{height:6,borderRadius:8},
 range:{flexDirection:'row',justifyContent:'space-between',marginTop:8},
 muted:{fontSize:11,color:colors.muted},footer:{fontSize:12,color:colors.muted,lineHeight:18,marginTop:7}
});
