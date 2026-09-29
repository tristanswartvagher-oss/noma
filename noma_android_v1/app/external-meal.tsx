import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import React,{useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {Page,PrimaryButton} from '@/src/components';
import {useApp} from '@/src/store';
import {colors,radius} from '@/src/theme';
import {MealType,isExternalMeal} from '@/src/types';

function numberValue(value:string){
  const normalized=value.replace(',','.').trim();
  const n=Number(normalized);
  return Number.isFinite(n)&&n>=0?n:0;
}

export default function ExternalMeal(){
  const {date,meal}=useLocalSearchParams<{date:string;meal:MealType}>();
  const {plan,setExternalMeal,removeMeal}=useApp();
  const current=plan[date]?.[meal];
  const existing=current&&isExternalMeal(current)?current:undefined;

  const [name,setName]=useState(existing?.name||'Repas du boulot');
  const [kcal,setKcal]=useState(existing?String(existing.kcal):'');
  const [protein,setProtein]=useState(existing?String(existing.protein):'');
  const [carbs,setCarbs]=useState(existing?String(existing.carbs):'');
  const [fat,setFat]=useState(existing?String(existing.fat):'');
  const [note,setNote]=useState(existing?.note||'');

  const valid=useMemo(()=>name.trim().length>0&&numberValue(kcal)>0,[name,kcal]);

  function save(){
    setExternalMeal(date,meal,{
      name:name.trim(),
      kcal:numberValue(kcal),
      protein:numberValue(protein),
      carbs:numberValue(carbs),
      fat:numberValue(fat),
      note
    });
    router.back();
  }

  return (
    <Page>
      <Pressable onPress={()=>router.back()} style={s.close}>
        <Ionicons name="close" size={24} color={colors.text}/>
      </Pressable>

      <Text style={s.title}>Repas externe</Text>
      <Text style={s.subtitle}>Aucune IA. Recopie simplement les valeurs du plat ou de l’étiquette.</Text>

      <View style={s.card}>
        <Text style={s.label}>Nom</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex. poulet curry du boulot"
          placeholderTextColor={colors.muted}
          style={s.input}
        />
      </View>

      <View style={s.card}>
        <Text style={s.h}>Macros du repas</Text>
        <Text style={s.helper}>Entre les valeurs pour toute la portion que tu vas manger.</Text>

        <View style={s.grid}>
          <MacroInput label="Calories" unit="kcal" value={kcal} onChange={setKcal}/>
          <MacroInput label="Protéines" unit="g" value={protein} onChange={setProtein}/>
          <MacroInput label="Glucides" unit="g" value={carbs} onChange={setCarbs}/>
          <MacroInput label="Lipides" unit="g" value={fat} onChange={setFat}/>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.label}>Note privée</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Optionnel"
          placeholderTextColor={colors.muted}
          style={[s.input,{minHeight:76,textAlignVertical:'top'}]}
        />
      </View>

      <View style={s.info}>
        <Ionicons name="basket-outline" size={20} color={colors.sageDark}/>
        <Text style={s.infoText}>Ce repas compte dans tes macros, mais jamais dans la liste de courses.</Text>
      </View>

      <PrimaryButton label={existing?'Enregistrer les modifications':'Ajouter au planning'} onPress={save} disabled={!valid}/>

      {existing&&(
        <Pressable
          style={s.remove}
          onPress={()=>{removeMeal(date,meal);router.back();}}
        >
          <Ionicons name="trash-outline" size={19} color={colors.danger}/>
          <Text style={s.removeText}>Retirer ce repas</Text>
        </Pressable>
      )}
    </Page>
  );
}

function MacroInput({label,unit,value,onChange}:{label:string;unit:string;value:string;onChange:(v:string)=>void}){
  return (
    <View style={s.macroBox}>
      <Text style={s.macroLabel}>{label}</Text>
      <View style={s.valueRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#A9B1AD"
          style={s.macroInput}
        />
        <Text style={s.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const s=StyleSheet.create({
  close:{alignSelf:'flex-end',width:44,height:44,alignItems:'center',justifyContent:'center'},
  title:{fontFamily:'Georgia',fontSize:35,fontWeight:'700',color:colors.text},
  subtitle:{fontSize:13,color:colors.muted,lineHeight:19,marginTop:4,marginBottom:14},
  card:{backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,borderRadius:radius.lg,padding:15,marginBottom:11},
  h:{fontSize:17,fontWeight:'900',color:colors.text},
  label:{fontSize:13,fontWeight:'900',color:colors.text,marginBottom:7},
  helper:{fontSize:12,color:colors.muted,marginTop:3,marginBottom:12},
  input:{minHeight:48,borderRadius:15,backgroundColor:'#F7F8F5',paddingHorizontal:12,color:colors.text},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:9},
  macroBox:{width:'48%',backgroundColor:'#F7F8F5',borderRadius:17,padding:12},
  macroLabel:{fontSize:12,color:colors.muted,fontWeight:'800'},
  valueRow:{flexDirection:'row',alignItems:'baseline',marginTop:4},
  macroInput:{flex:1,fontSize:22,fontWeight:'900',color:colors.text,padding:0},
  unit:{fontSize:12,color:colors.muted,fontWeight:'800'},
  info:{flexDirection:'row',alignItems:'center',gap:9,backgroundColor:colors.sageSoft,borderRadius:18,padding:13,marginBottom:12},
  infoText:{flex:1,color:colors.sageDark,fontSize:12.5,lineHeight:18,fontWeight:'700'},
  remove:{minHeight:52,marginTop:8,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},
  removeText:{color:colors.danger,fontWeight:'900'}
});
