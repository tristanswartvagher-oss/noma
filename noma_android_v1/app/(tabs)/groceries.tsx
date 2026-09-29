import {Ionicons} from '@expo/vector-icons';
import React,{useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {Page,ScreenTitle} from '@/src/components';
import {addWeeks,formatWeekRange,fromIso,weekKey} from '@/src/date';
import {buildGroceriesForWeek,prettyQuantity} from '@/src/groceries';
import {useApp} from '@/src/store';
import {colors,radius} from '@/src/theme';

export default function Groceries(){
  const {
    plan,recipes,foods,learning,
    groceryChecked,alreadyHave,customGroceries,
    toggleGroceryChecked,toggleAlreadyHave,
    addCustomGrocery,toggleCustomGrocery,removeCustomGrocery,resetWeekChecks,
    selectedWeekStart,setSelectedWeekStart
  }=useApp();

  const [q,setQ]=useState('');
  const week=selectedWeekStart;
  const start=fromIso(week);
  const items=useMemo(
    ()=>buildGroceriesForWeek(plan,week,recipes,foods,learning),
    [plan,week,recipes,foods,learning]
  );
  const manual=customGroceries[week]||[];
  const checks=groceryChecked[week]||{};
  const have=alreadyHave[week]||{};

  const groups=items.reduce<Record<string,typeof items>>((acc,item)=>{
    (acc[item.category]??=[]).push(item);
    return acc;
  },{});

  const buyable=items.filter(i=>!have[i.key]);
  const done=buyable.filter(i=>checks[i.key]).length+manual.filter(i=>i.checked).length;
  const total=buyable.length+manual.length;

  function moveWeek(delta:number){
    setSelectedWeekStart(weekKey(addWeeks(start,delta)));
  }

  return (
    <Page>
      <ScreenTitle title="Courses" subtitle="Seulement les repas de la semaine affichée."/>

      <View style={s.weekNav}>
        <Pressable onPress={()=>moveWeek(-1)} style={s.nav}>
          <Ionicons name="chevron-back" size={20} color={colors.text}/>
        </Pressable>
        <View style={{alignItems:'center'}}>
          <Text style={s.weekText}>{formatWeekRange(start)}</Text>
          <Text style={s.muted}>Même semaine que ton planning</Text>
        </View>
        <Pressable onPress={()=>moveWeek(1)} style={s.nav}>
          <Ionicons name="chevron-forward" size={20} color={colors.text}/>
        </Pressable>
      </View>

      <View style={s.summary}>
        <View>
          <Text style={s.n}>{Math.max(0,total-done)}</Text>
          <Text style={s.muted}>reste à prendre</Text>
        </View>
        <View style={s.div}/>
        <View>
          <Text style={s.n}>{done}</Text>
          <Text style={s.muted}>dans le panier</Text>
        </View>
        {(done>0||Object.values(have).some(Boolean))&&(
          <Pressable onPress={()=>resetWeekChecks(week)} style={s.reset}>
            <Ionicons name="refresh" size={17} color={colors.sageDark}/>
          </Pressable>
        )}
      </View>

      <View style={s.add}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Ajouter un produit"
          placeholderTextColor={colors.muted}
          style={{flex:1,color:colors.text}}
          onSubmitEditing={()=>{addCustomGrocery(week,q);setQ('');}}
          returnKeyType="done"
        />
        <Pressable onPress={()=>{addCustomGrocery(week,q);setQ('');}}>
          <Ionicons name="add-circle" size={30} color={colors.sage}/>
        </Pressable>
      </View>

      {manual.length>0&&(
        <View style={s.card}>
          <Text style={s.cat}>Ajouts manuels</Text>
          {manual.map(item=>(
            <View key={item.id} style={s.row}>
              <Pressable
                accessibilityLabel={item.checked?'Décocher':'Cocher'}
                onPress={()=>toggleCustomGrocery(week,item.id)}
                style={[s.check,item.checked&&s.checkOn]}
              >
                {item.checked?<Ionicons name="checkmark" size={16} color="#fff"/>:null}
              </Pressable>
              <Text style={[s.item,{flex:1},item.checked&&s.done]}>{item.label}</Text>
              <Pressable onPress={()=>removeCustomGrocery(week,item.id)} style={s.trash}>
                <Ionicons name="trash-outline" size={18} color={colors.muted}/>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {Object.entries(groups).map(([category,list])=>(
        <View key={category} style={s.card}>
          <View style={s.catHead}>
            <Text style={s.cat}>{category}</Text>
            <Text style={s.muted}>{list.filter(i=>!have[i.key]).length}</Text>
          </View>

          {list.map(item=>{
            const hidden=Boolean(have[item.key]);
            const checked=Boolean(checks[item.key]);
            return (
              <View key={item.key} style={[s.row,hidden&&{opacity:.45}]}>
                <Pressable
                  accessibilityLabel={checked?'Décocher':'Cocher'}
                  onPress={()=>toggleGroceryChecked(week,item.key)}
                  style={[s.check,checked&&s.checkOn]}
                >
                  {checked?<Ionicons name="checkmark" size={16} color="#fff"/>:null}
                </Pressable>

                <View style={{flex:1}}>
                  <Text style={[s.item,checked&&s.done]}>{item.name}</Text>
                  <Pressable onPress={()=>toggleAlreadyHave(week,item.key)}>
                    <Text style={s.have}>{hidden?'Remettre dans les courses':'J’en ai déjà'}</Text>
                  </Pressable>
                </View>

                <Text style={[s.qty,checked&&s.done]}>{prettyQuantity(item.amount,item.unit)}</Text>
              </View>
            );
          })}
        </View>
      ))}

      {items.length===0&&manual.length===0?(
        <View style={s.empty}>
          <Ionicons name="basket-outline" size={30} color={colors.sage}/>
          <Text style={s.emptyTitle}>Rien à acheter</Text>
          <Text style={s.muted}>Ajoute des repas dans cette semaine : la liste se construira toute seule.</Text>
        </View>
      ):null}
    </Page>
  );
}

const s=StyleSheet.create({
  weekNav:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},
  nav:{width:42,height:42,borderRadius:21,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'},
  weekText:{fontWeight:'900',fontSize:14,color:colors.text},
  summary:{backgroundColor:colors.sageSoft,borderRadius:radius.lg,padding:15,flexDirection:'row',alignItems:'center',gap:18,marginBottom:12},
  n:{fontSize:23,fontWeight:'900',color:colors.text},
  muted:{fontSize:12,color:colors.muted,marginTop:2,lineHeight:17},
  div:{width:1,height:40,backgroundColor:'#D7E0D3'},
  reset:{marginLeft:'auto',width:38,height:38,borderRadius:19,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},
  add:{height:49,borderRadius:999,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,flexDirection:'row',alignItems:'center',paddingHorizontal:14,marginBottom:12},
  card:{backgroundColor:'#fff',borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,paddingHorizontal:14,paddingVertical:8,marginBottom:11},
  catHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  cat:{fontWeight:'900',fontSize:17,color:colors.text,paddingVertical:9},
  row:{minHeight:54,borderTopWidth:1,borderTopColor:'#F0F2EE',flexDirection:'row',alignItems:'center',gap:10},
  check:{width:28,height:28,borderRadius:14,borderWidth:1.5,borderColor:'#A8B2AD',alignItems:'center',justifyContent:'center'},
  checkOn:{backgroundColor:colors.sage,borderColor:colors.sage},
  item:{color:colors.text,fontSize:15},
  qty:{color:colors.muted,fontSize:14,fontWeight:'700'},
  done:{textDecorationLine:'line-through',color:'#A8AEAA'},
  have:{fontSize:11,color:colors.sageDark,fontWeight:'800',marginTop:3},
  trash:{width:38,height:38,alignItems:'center',justifyContent:'center'},
  empty:{alignItems:'center',padding:24,backgroundColor:'#fff',borderRadius:radius.lg,borderWidth:1,borderColor:colors.border},
  emptyTitle:{marginTop:8,fontSize:17,fontWeight:'900',color:colors.text}
});
