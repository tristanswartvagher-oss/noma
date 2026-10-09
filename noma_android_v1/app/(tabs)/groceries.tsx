import {Ionicons} from '@expo/vector-icons';
import React,{useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {Page} from '@/src/components';
import {PageHeading,ProgressRing,SoftCard} from '@/src/ui';
import {addWeeks,formatWeekRange,fromIso,weekKey} from '@/src/date';
import {buildGroceriesForWeek,prettyQuantity} from '@/src/groceries';
import {useApp} from '@/src/store';
import {colors,shadow} from '@/src/theme';

const iconFor=(category:string):keyof typeof Ionicons.glyphMap=>{
 const t=category.toLowerCase();
 if(/fruit|légume|legume/.test(t))return 'leaf-outline';
 if(/frais|laitier|viande|poisson/.test(t))return 'basket-outline';
 if(/céréal|cereal|légumine|legumine/.test(t))return 'nutrition-outline';
 return 'storefront-outline';
};
export default function Groceries(){
 const {plan,recipes,foods,learning,groceryChecked,alreadyHave,customGroceries,toggleGroceryChecked,toggleAlreadyHave,addCustomGrocery,toggleCustomGrocery,removeCustomGrocery,resetWeekChecks,selectedWeekStart,setSelectedWeekStart}=useApp();
 const [q,setQ]=useState('');
 const [expanded,setExpanded]=useState<Record<string,boolean>>({});
 const week=selectedWeekStart;
 const start=fromIso(week);
 const items=useMemo(()=>buildGroceriesForWeek(plan,week,recipes,foods,learning),[plan,week,recipes,foods,learning]);
 const manual=customGroceries[week]||[];
 const checks=groceryChecked[week]||{};
 const have=alreadyHave[week]||{};
 const groups=items.reduce<Record<string,typeof items>>((acc,item)=>{(acc[item.category]??=[]).push(item);return acc;},{});
 const done=items.filter(i=>Boolean(have[i.key])||Boolean(checks[i.key])).length+manual.filter(i=>i.checked).length;
 const total=items.length+manual.length;
 const pct=total?done/total*100:0;
 const add=()=>{if(!q.trim())return;addCustomGrocery(week,q.trim());setQ('');};
 return <Page>
  <PageHeading title="Courses" subtitle="Ta liste de courses, prête à l'emploi."/>
  <View style={s.weekNav}>
   <Pressable accessibilityLabel="Semaine précédente" style={s.arrow} onPress={()=>setSelectedWeekStart(weekKey(addWeeks(start,-1)))}><Ionicons name="chevron-back" size={18} color={colors.text}/></Pressable>
   <Text style={s.weekText}>{formatWeekRange(start)}</Text>
   <Pressable accessibilityLabel="Semaine suivante" style={s.arrow} onPress={()=>setSelectedWeekStart(weekKey(addWeeks(start,1)))}><Ionicons name="chevron-forward" size={18} color={colors.text}/></Pressable>
  </View>
  <SoftCard style={s.summary}><ProgressRing percent={pct} size={55}/><View style={{flex:1}}>
   <Text style={s.count}>{done}/{total} <Text style={s.muted}>articles</Text></Text>
   <View style={s.track}><View style={[s.fill,{width:pct+'%'}]}/></View>
  </View><Text style={s.badge}>{Math.round(pct)}%</Text></SoftCard>
  <View style={s.add}><Pressable accessibilityLabel="Ajouter un produit" onPress={add} style={s.addCircle}><Ionicons name="add" size={20} color={colors.sageDark}/></Pressable>
   <TextInput value={q} onChangeText={setQ} placeholder="Ajouter un produit..." placeholderTextColor={colors.muted} returnKeyType="done" onSubmitEditing={add} style={{flex:1,fontSize:13,color:colors.text}}/>
  </View>
  {manual.length>0?<SoftCard style={s.card}><Text style={s.category}>Ajouts manuels</Text>{manual.map(item=><View style={s.row} key={item.id}>
   <Pressable accessibilityLabel={item.checked?'Décocher':'Cocher'} onPress={()=>toggleCustomGrocery(week,item.id)} style={[s.check,item.checked&&s.checkOn]}>{item.checked?<Ionicons name="checkmark" size={15} color="#fff"/>:null}</Pressable>
   <Text style={[s.item,{flex:1},item.checked&&s.done]}>{item.label}</Text>
   <Pressable accessibilityLabel="Supprimer" onPress={()=>removeCustomGrocery(week,item.id)} style={{padding:9}}><Ionicons name="trash-outline" color={colors.muted} size={18}/></Pressable>
  </View>)}</SoftCard>:null}
  {Object.entries(groups).map(([category,list])=>{
   const open=expanded[category]!==false;
   const complete=list.filter(i=>Boolean(have[i.key])||Boolean(checks[i.key])).length;
   return <SoftCard key={category} style={s.card}>
    <Pressable accessibilityRole="button" onPress={()=>setExpanded(v=>({...v,[category]:!open}))} style={s.catHead}>
     <Ionicons name={iconFor(category)} size={19} color={colors.sageDark}/><Text numberOfLines={1} style={[s.category,{flex:1}]}>{category}</Text><Text style={s.muted}>{complete}/{list.length}</Text><Ionicons name={open?'chevron-up':'chevron-down'} color={colors.muted} size={17}/>
    </Pressable>
    {open?list.map(item=>{
     const checked=Boolean(checks[item.key]);
     const hidden=Boolean(have[item.key]);
     return <View style={s.row} key={item.key}>
      <Pressable accessibilityRole="checkbox" accessibilityState={{checked:checked||hidden}} accessibilityLabel={'Acheter '+item.name} onPress={()=>toggleGroceryChecked(week,item.key)} style={[s.check,(checked||hidden)&&s.checkOn]}>
       {checked||hidden?<Ionicons name="checkmark" size={15} color="#fff"/>:null}
      </Pressable>
      <Text style={[s.item,{flex:1},(checked||hidden)&&s.done]} numberOfLines={2}>{item.name}</Text>
      <Text style={s.qty}>{prettyQuantity(item.amount,item.unit)}</Text>
      <Pressable onPress={()=>toggleAlreadyHave(week,item.key)} accessibilityRole="button" accessibilityState={{selected:hidden}} style={[s.have,hidden&&s.haveOn]}>
       <Text numberOfLines={1} style={[s.haveText,hidden&&{color:'#fff'}]}>{hidden?'Déjà chez moi':"J'en ai déjà"}</Text>
      </Pressable>
     </View>;
    }):null}
   </SoftCard>;
  })}
  {items.length===0&&manual.length===0?<SoftCard style={s.empty}><Ionicons name="basket-outline" size={30} color={colors.sage}/><Text style={s.category}>Rien à acheter pour l'instant</Text><Text style={s.muted}>Planifie un repas : les ingrédients arriveront ici.</Text></SoftCard>:null}
  {(done>0||Object.values(have).some(Boolean))?<Pressable onPress={()=>resetWeekChecks(week)} style={s.reset}><Ionicons name="refresh-outline" color={colors.muted} size={15}/><Text style={s.muted}>Réinitialiser les coches</Text></Pressable>:null}
 </Page>;
}
const s=StyleSheet.create({
 weekNav:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},
 arrow:{height:32,width:40,alignItems:'center',justifyContent:'center'},
 weekText:{color:colors.text,fontSize:13,fontWeight:'700'},
 summary:{flexDirection:'row',alignItems:'center',gap:12,padding:13,marginBottom:11},
 count:{fontSize:18,fontWeight:'900',color:colors.text},muted:{fontSize:12,color:colors.muted},
 track:{height:5,backgroundColor:colors.sageSoft,borderRadius:8,marginTop:8,overflow:'hidden'},
 fill:{height:5,backgroundColor:colors.sage,borderRadius:8},
 badge:{backgroundColor:colors.sageSoft,color:colors.sageDark,paddingHorizontal:9,paddingVertical:6,overflow:'hidden',borderRadius:99,fontWeight:'700',fontSize:12},
 add:{height:51,borderRadius:28,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',gap:9,paddingHorizontal:10,marginBottom:13,borderWidth:1,borderColor:colors.border,...shadow},
 addCircle:{width:35,height:35,backgroundColor:colors.sageSoft,alignItems:'center',justifyContent:'center',borderRadius:19},
 card:{paddingHorizontal:12,paddingTop:7,paddingBottom:8,marginBottom:11},
 catHead:{flexDirection:'row',alignItems:'center',gap:9,minHeight:42},
 category:{color:colors.text,fontSize:14,fontWeight:'800'},
 row:{flexDirection:'row',alignItems:'center',gap:8,minHeight:45,borderTopWidth:1,borderTopColor:'#F4F5F0'},
 check:{width:24,height:24,borderRadius:5,borderWidth:1.5,borderColor:'#81928E',alignItems:'center',justifyContent:'center'},
 checkOn:{backgroundColor:colors.sage,borderColor:colors.sage},
 item:{fontSize:12.5,color:colors.text},done:{textDecorationLine:'line-through',color:'#9CA7A2'},
 qty:{fontSize:11.5,color:colors.muted,maxWidth:60},
 have:{borderRadius:99,paddingHorizontal:7,paddingVertical:8,backgroundColor:colors.sageSoft,maxWidth:88},
 haveOn:{backgroundColor:colors.sageDark},
 haveText:{fontSize:10,color:colors.sageDark,textAlign:'center'},
 reset:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,padding:15},
 empty:{padding:28,alignItems:'center',gap:9}
});
