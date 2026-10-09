import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import React,{useState} from 'react';
import {Alert,Pressable,StyleSheet,Text,View} from 'react-native';
import {Page,PrimaryButton,Stepper} from '@/src/components';
import {perServing,roundMacro} from '@/src/nutrition';
import {useApp} from '@/src/store';
import {colors,radius} from '@/src/theme';

function formatAmount(value:number){
  const rounded=Math.round(value*10)/10;
  return Number.isInteger(rounded)?String(Math.round(rounded)):String(rounded);
}

export default function RecipeDetail(){
  const {id}=useLocalSearchParams<{id:string}>();
  const {
    recipes,foods,learning,goals,favorites,toggleFavorite,
    resetRecipeLearning,resetIngredientAdjustment,deleteRecipe
  }=useApp();
  const recipe=recipes.find(r=>r.id===id);
  const learned=learning[id];
  const [servings,setServings]=useState(recipe?.defaultServings||1);

  if(!recipe){
    return <Page><Text style={s.title}>Recette introuvable</Text><PrimaryButton label="Retour" onPress={()=>router.back()}/></Page>;
  }

  const scale=servings/recipe.defaultServings;
  const macro=perServing(recipe,foods,learned);
  const adjustedIngredients=Object.entries(learned?.ingredientMultipliers||{}).filter(([,m])=>Math.abs(m-1)>.001);
  const globalAdjusted=learned&&Math.abs(learned.overallMultiplier-1)>.001;

  function confirmDelete(){
    if(!recipe) return;
    const recipeIdToDelete=recipe.id;
    Alert.alert(
      'Supprimer cette recette ?',
      'Elle sera aussi retirée des repas où elle était planifiée.',
      [
        {text:'Annuler',style:'cancel'},
        {text:'Supprimer',style:'destructive',onPress:()=>{deleteRecipe(recipeIdToDelete);router.back();}}
      ]
    );
  }

  return (
    <Page>
      <View style={s.topbar}>
        <Pressable onPress={()=>router.back()} style={s.iconButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text}/>
        </Pressable>
        <View style={{flexDirection:'row',gap:4}}>
          {recipe.custom&&(
            <Pressable onPress={()=>router.push({pathname:'/new-recipe',params:{id:recipe.id}})} style={s.iconButton}>
              <Ionicons name="create-outline" size={22} color={colors.text}/>
            </Pressable>
          )}
          <Pressable onPress={()=>toggleFavorite(recipe.id)} style={s.iconButton}>
            <Ionicons name={favorites[recipe.id]?'heart':'heart-outline'} size={23} color={favorites[recipe.id]?colors.sage:colors.text}/>
          </Pressable>
        </View>
      </View>

      <Text style={s.title}>{recipe.title}</Text>
      <Text style={s.subtitle}>{recipe.category} · {recipe.timeMinutes} min{recipe.custom?' · Recette perso':''}</Text>

      <View style={s.hero}><Text style={{fontSize:82}}>{recipe.emoji}</Text></View>

      <View style={s.servings}>
        <Stepper
          value={servings}
          label="portions"
          onMinus={()=>setServings(Math.max(1,servings-1))}
          onPlus={()=>setServings(servings+1)}
        />
      </View>

      {goals.enabled&&(
        <View style={s.macros}>
          {[
            ['kcal',Math.round(macro.kcal),'kcal'],
            ['prot',roundMacro(macro.protein),'g'],
            ['gluc',roundMacro(macro.carbs),'g'],
            ['lip',roundMacro(macro.fat),'g']
          ].map(([key,value,unit])=>(
            <View key={String(key)} style={s.macro}>
              <Text style={s.macroN}>{value}</Text>
              <Text style={s.small}>{unit} {key!=='kcal'?key:''}</Text>
            </View>
          ))}
          <Text style={s.perPart}>par portion</Text>
        </View>
      )}

      <View style={s.card}>
        <View style={s.cardHead}>
          <Text style={s.h}>Ingrédients</Text>
          <Text style={s.small}>{servings} portions</Text>
        </View>

        {recipe.ingredients.map(ing=>{
          const food=foods.find(f=>f.id===ing.foodId);
          if(!food) return null;
          const personal=learned?.ingredientMultipliers?.[ing.foodId]||1;
          const overall=learned?.overallMultiplier||1;
          const amount=ing.amount*scale*overall*personal;
          const changed=Math.abs(overall*personal-1)>.001;
          return (
            <View key={`${ing.foodId}-${ing.unit}`} style={s.row}>
              <View style={{flex:1}}>
                <Text style={s.item}>{food.name}</Text>
                {changed?<Text style={s.personal}>adapté par Noma</Text>:null}
              </View>
              <Text style={s.qty}>{formatAmount(amount)} {ing.unit}</Text>
            </View>
          );
        })}
      </View>

      {learned&&(
        <View style={s.learnCard}>
          <View style={s.learnTitle}>
            <Ionicons name="sparkles-outline" size={21} color={colors.sageDark}/>
            <Text style={s.h}>Chez toi</Text>
          </View>

          {globalAdjusted&&(
            <View style={s.adjustment}>
              <Text style={s.item}>Quantité globale</Text>
              <Text style={s.multiplier}>{learned.overallMultiplier>=1?'+':''}{Math.round((learned.overallMultiplier-1)*100)}%</Text>
            </View>
          )}

          {adjustedIngredients.map(([foodId,multiplier])=>{
            const food=foods.find(f=>f.id===foodId);
            return (
              <View key={foodId} style={s.adjustment}>
                <Text style={[s.item,{flex:1}]}>{food?.name||foodId}</Text>
                <Text style={s.multiplier}>{multiplier>=1?'+':''}{Math.round((multiplier-1)*100)}%</Text>
                <Pressable accessibilityLabel="Supprimer cet ajustement" onPress={()=>resetIngredientAdjustment(recipe.id,foodId)} style={s.miniButton}>
                  <Ionicons name="close" size={16} color={colors.muted}/>
                </Pressable>
              </View>
            );
          })}

          {learned.notes.at(-1)?<Text style={s.note}>“{learned.notes.at(-1)}”</Text>:null}

          <Pressable onPress={()=>resetRecipeLearning(recipe.id)} style={s.reset}>
            <Text style={s.resetText}>Réinitialiser tous les ajustements</Text>
          </Pressable>
        </View>
      )}

      <View style={s.card}>
        <Text style={s.h}>Étapes</Text>
        {recipe.steps.map((step,index)=>(
          <View key={index} style={s.step}>
            <View style={s.stepN}><Text style={{fontWeight:'900',color:colors.sageDark}}>{index+1}</Text></View>
            <Text style={s.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={{marginTop:12}}>
        <PrimaryButton
          label="Après le repas"
          icon="sparkles-outline"
          onPress={()=>router.push(`/feedback/${recipe.id}`)}
        />
      </View>

      {recipe.custom&&(
        <Pressable onPress={confirmDelete} style={s.delete}>
          <Ionicons name="trash-outline" size={18} color={colors.danger}/>
          <Text style={s.deleteText}>Supprimer la recette</Text>
        </Pressable>
      )}
    </Page>
  );
}

const s=StyleSheet.create({
  topbar:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  iconButton:{width:44,height:44,alignItems:'center',justifyContent:'center'},
  title:{fontFamily:'Georgia',fontSize:36,fontWeight:'700',color:colors.text,marginTop:4},
  subtitle:{color:colors.muted,fontSize:13,marginTop:3,marginBottom:12},
  hero:{height:190,borderRadius:radius.lg,backgroundColor:colors.beige,alignItems:'center',justifyContent:'center',marginBottom:12},
  servings:{backgroundColor:'#fff',borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,padding:13,alignItems:'center'},
  macros:{position:'relative',flexDirection:'row',backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,borderRadius:radius.md,marginTop:10,marginBottom:20,overflow:'visible'},
  macro:{flex:1,alignItems:'center',paddingVertical:13,borderRightWidth:1,borderRightColor:colors.border},
  macroN:{fontWeight:'900',color:colors.text},
  small:{fontSize:11.5,color:colors.muted,marginTop:2},
  perPart:{position:'absolute',bottom:-18,right:5,fontSize:10.5,color:colors.muted},
  card:{backgroundColor:'#fff',borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,padding:16,marginTop:11},
  cardHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  h:{fontSize:17,fontWeight:'900',color:colors.text},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:10,borderTopWidth:1,borderTopColor:'#F0F2EE'},
  item:{color:colors.text,fontSize:14.5},
  personal:{fontSize:10.5,color:colors.sageDark,fontWeight:'800',marginTop:2},
  qty:{color:colors.muted,fontWeight:'700'},
  learnCard:{backgroundColor:colors.sageSoft,borderRadius:radius.lg,padding:16,marginTop:11},
  learnTitle:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8},
  adjustment:{minHeight:42,flexDirection:'row',alignItems:'center',gap:8,borderTopWidth:1,borderTopColor:'#DCE6D7'},
  multiplier:{fontWeight:'900',color:colors.sageDark},
  miniButton:{width:32,height:32,borderRadius:16,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},
  note:{fontSize:12.5,color:colors.text,fontStyle:'italic',marginTop:10},
  reset:{alignSelf:'flex-start',marginTop:12,paddingVertical:8},
  resetText:{fontSize:12,color:colors.sageDark,fontWeight:'900'},
  step:{flexDirection:'row',gap:10,paddingVertical:9},
  stepN:{width:28,height:28,borderRadius:14,backgroundColor:colors.sageSoft,alignItems:'center',justifyContent:'center'},
  stepText:{flex:1,color:colors.text,lineHeight:21},
  delete:{minHeight:52,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,marginTop:10},
  deleteText:{fontWeight:'900',color:colors.danger}
});
