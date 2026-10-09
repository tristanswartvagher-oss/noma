import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {Page,PrimaryButton,Stepper} from '@/src/components';
import {useApp} from '@/src/store';
import {colors,radius} from '@/src/theme';
import {MealType,isExternalMeal,isRecipeMeal} from '@/src/types';

export default function MealEditor(){
  const {date,meal}=useLocalSearchParams<{date:string;meal:MealType}>();
  const {plan,recipes,changeCookedServings,changeConsumedServings,removeMeal}=useApp();

  const planned=plan[date]?.[meal];

  if(planned&&isExternalMeal(planned)){
    router.replace({pathname:'/external-meal',params:{date,meal}});
    return null;
  }

  const recipe=planned&&isRecipeMeal(planned)?recipes.find(r=>r.id===planned.recipeId):undefined;

  if(!planned||!isRecipeMeal(planned)||!recipe){
    return <Page><Text style={s.title}>Repas introuvable</Text><PrimaryButton label="Fermer" onPress={()=>router.back()}/></Page>;
  }

  return (
    <Page>
      <Pressable onPress={()=>router.back()} style={s.close}>
        <Ionicons name="close" size={24} color={colors.text}/>
      </Pressable>

      <View style={s.hero}>
        <Text style={{fontSize:58}}>{recipe.emoji}</Text>
        <Text style={s.title}>{recipe.title}</Text>
        <Text style={s.muted}>{recipe.timeMinutes} min · {recipe.category}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.h}>À préparer</Text>
        <Text style={s.muted}>Cette quantité alimente la liste de courses.</Text>
        <View style={s.center}>
          <Stepper value={planned.cookedServings} label="portions"
            onMinus={()=>changeCookedServings(date,meal,-1)}
            onPlus={()=>changeCookedServings(date,meal,1)}/>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.h}>Pour moi</Text>
        <Text style={s.muted}>Cette quantité compte dans tes macros de la journée.</Text>
        <View style={s.center}>
          <Stepper value={planned.consumedServings} label="portion(s)"
            onMinus={()=>changeConsumedServings(date,meal,-.5)}
            onPlus={()=>changeConsumedServings(date,meal,.5)}/>
        </View>
      </View>

      <PrimaryButton label="Remplacer le repas" icon="swap-horizontal-outline"
        onPress={()=>router.replace({pathname:'/pick-recipe',params:{date,meal}})}/>

      <Pressable style={s.remove} onPress={()=>{removeMeal(date,meal);router.back();}}>
        <Ionicons name="trash-outline" size={19} color={colors.danger}/>
        <Text style={s.removeText}>Retirer ce repas</Text>
      </Pressable>
    </Page>
  );
}

const s=StyleSheet.create({
  close:{alignSelf:'flex-end',width:44,height:44,alignItems:'center',justifyContent:'center'},
  hero:{alignItems:'center',marginBottom:14},
  title:{fontSize:31,fontWeight:'700',color:colors.text,textAlign:'center',marginTop:8},
  muted:{fontSize:12.5,color:colors.muted,marginTop:4,lineHeight:18},
  card:{backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,borderRadius:radius.lg,padding:16,marginBottom:11},
  h:{fontSize:17,fontWeight:'900',color:colors.text},
  center:{alignItems:'center',marginTop:16},
  remove:{minHeight:52,marginTop:10,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},
  removeText:{color:colors.danger,fontWeight:'900'}
});
