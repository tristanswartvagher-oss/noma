import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import React,{useMemo,useState} from 'react';
import {Alert,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {Chip,Page,PrimaryButton} from '@/src/components';
import {useApp} from '@/src/store';
import {normalizeText} from '@/src/text';
import {colors,radius} from '@/src/theme';
import {IngredientUnit,RecipeCategory,RecipeIngredient} from '@/src/types';

const categories:RecipeCategory[]=['Entrée','Plat','Dessert & Encas'];

function defaultEmoji(category:RecipeCategory){
  if(category==='Entrée') return '🥗';
  if(category==='Dessert & Encas') return '🍎';
  return '🍽️';
}

export default function RecipeForm(){
  const {id}=useLocalSearchParams<{id?:string}>();
  const {foods,recipes,addRecipe,updateRecipe}=useApp();
  const existing=id?recipes.find(r=>r.id===id&&r.custom):undefined;

  const [title,setTitle]=useState(existing?.title||'');
  const [category,setCategory]=useState<RecipeCategory>(existing?.category||'Plat');
  const [servings,setServings]=useState(String(existing?.defaultServings||4));
  const [time,setTime]=useState(String(existing?.timeMinutes||30));
  const [query,setQuery]=useState('');
  const [ingredients,setIngredients]=useState<RecipeIngredient[]>(existing?.ingredients||[]);
  const [steps,setSteps]=useState((existing?.steps||[]).join('\n'));

  const results=useMemo(()=>{
    const q=normalizeText(query);
    if(q.length<2) return [];
    return foods
      .filter(f=>normalizeText(f.name).includes(q))
      .filter(f=>!ingredients.some(i=>i.foodId===f.id))
      .slice(0,8);
  },[query,foods,ingredients]);

  function addIngredient(foodId:string){
    const food=foods.find(f=>f.id===foodId);
    if(!food) return;
    const unit:IngredientUnit=food.referenceUnit;
    setIngredients(list=>[
      ...list,
      {foodId,amount:100,unit,nutritionAmount:100}
    ]);
    setQuery('');
  }

  function updateAmount(index:number,value:string){
    const amount=Math.max(0,Number(value.replace(',','.'))||0);
    setIngredients(list=>list.map((ing,i)=>{
      if(i!==index) return ing;
      const food=foods.find(f=>f.id===ing.foodId);
      const nutritionAmount=ing.unit==='pièce'
        ? amount*(food?.pieceWeight||0)
        : amount;
      return {...ing,amount,nutritionAmount};
    }));
  }

  function switchUnit(index:number,unit:IngredientUnit){
    setIngredients(list=>list.map((ing,i)=>{
      if(i!==index) return ing;
      const food=foods.find(f=>f.id===ing.foodId);
      if(unit==='pièce'){
        if(!food?.pieceWeight) return ing;
        return {...ing,unit,amount:Math.round((ing.nutritionAmount/food.pieceWeight)*10)/10};
      }
      return {...ing,unit,amount:Math.round(ing.nutritionAmount*10)/10};
    }));
  }

  function removeIngredient(index:number){
    setIngredients(list=>list.filter((_,i)=>i!==index));
  }

  function save(){
    const cleanTitle=title.trim();
    const parts=Math.max(1,Number(servings)||1);
    const minutes=Math.max(0,Number(time)||0);
    const cleanSteps=steps.split('\n').map(s=>s.trim()).filter(Boolean);

    if(!cleanTitle){
      Alert.alert('Nom manquant','Donne un nom à la recette.');
      return;
    }
    if(ingredients.length===0){
      Alert.alert('Ingrédients manquants','Ajoute au moins un ingrédient.');
      return;
    }
    if(ingredients.some(i=>i.amount<=0||i.nutritionAmount<=0)){
      Alert.alert('Quantité invalide','Chaque ingrédient doit avoir une quantité supérieure à zéro.');
      return;
    }

    const recipe={
      id:existing?.id||`custom_${Date.now()}`,
      title:cleanTitle,
      category,
      defaultServings:parts,
      timeMinutes:minutes,
      emoji:existing?.emoji||defaultEmoji(category),
      ingredients,
      steps:cleanSteps,
      tags:['Perso'],
      custom:true
    };

    if(existing) updateRecipe(recipe);
    else addRecipe(recipe);

    router.back();
  }

  return (
    <Page>
      <Text onPress={()=>router.back()} style={s.close}>Fermer</Text>
      <Text style={s.title}>{existing?'Modifier la recette':'Nouvelle recette'}</Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Nom de la recette"
        style={s.input}
        placeholderTextColor={colors.muted}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
        {categories.map(cat=><Chip key={cat} label={cat} active={category===cat} onPress={()=>setCategory(cat)}/>)}
      </ScrollView>

      <View style={s.two}>
        <View style={{flex:1}}>
          <Text style={s.label}>Portions</Text>
          <TextInput
            value={servings}
            onChangeText={setServings}
            keyboardType="numeric"
            style={s.input}
            placeholderTextColor={colors.muted}
          />
        </View>
        <View style={{flex:1}}>
          <Text style={s.label}>Temps (min)</Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            keyboardType="numeric"
            style={s.input}
            placeholderTextColor={colors.muted}
          />
        </View>
      </View>

      <Text style={s.h}>Ingrédients</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher un aliment"
        style={s.input}
        placeholderTextColor={colors.muted}
      />

      {results.map(food=>(
        <Pressable key={food.id} onPress={()=>addIngredient(food.id)} style={s.foodResult}>
          <View style={{flex:1}}>
            <Text style={s.foodName}>{food.name}</Text>
            <Text style={s.muted}>{food.state} · /100 {food.referenceUnit}</Text>
          </View>
          <Ionicons name="add-circle" size={25} color={colors.sage}/>
        </Pressable>
      ))}

      <View style={{gap:8,marginTop:4}}>
        {ingredients.map((ing,index)=>{
          const food=foods.find(f=>f.id===ing.foodId);
          if(!food) return null;
          const units:IngredientUnit[]=food.pieceWeight?[food.referenceUnit,'pièce']:[food.referenceUnit];
          return (
            <View key={`${ing.foodId}-${index}`} style={s.ingCard}>
              <View style={s.ingTop}>
                <Text style={s.foodName}>{food.name}</Text>
                <Pressable onPress={()=>removeIngredient(index)} style={s.remove}>
                  <Ionicons name="trash-outline" size={18} color={colors.muted}/>
                </Pressable>
              </View>
              <View style={s.ingControls}>
                <TextInput
                  keyboardType="decimal-pad"
                  value={String(ing.amount)}
                  onChangeText={value=>updateAmount(index,value)}
                  style={s.qty}
                />
                <View style={s.unitRow}>
                  {units.map(unit=>(
                    <Pressable
                      key={unit}
                      onPress={()=>switchUnit(index,unit)}
                      style={[s.unit,ing.unit===unit&&s.unitOn]}
                    >
                      <Text style={[s.unitText,ing.unit===unit&&{color:'#fff'}]}>{unit}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={s.h}>Étapes</Text>
      <Text style={s.muted}>Une étape par ligne.</Text>
      <TextInput
        value={steps}
        onChangeText={setSteps}
        multiline
        placeholder={'Cuire le riz\nFaire revenir le poulet\nAssembler…'}
        style={[s.input,{minHeight:120,textAlignVertical:'top',paddingTop:13}]}
        placeholderTextColor={colors.muted}
      />

      <View style={{marginTop:6}}>
        <PrimaryButton label={existing?'Enregistrer les modifications':'Créer la recette'} onPress={save}/>
      </View>
    </Page>
  );
}

const s=StyleSheet.create({
  close:{alignSelf:'flex-end',fontWeight:'900',color:colors.sageDark,marginBottom:8},
  title:{fontFamily:'Georgia',fontSize:34,fontWeight:'700',color:colors.text,marginBottom:14},
  input:{minHeight:48,borderRadius:16,borderWidth:1,borderColor:colors.border,backgroundColor:'#fff',paddingHorizontal:13,color:colors.text},
  chips:{gap:7,marginVertical:10},
  two:{flexDirection:'row',gap:9,marginBottom:4},
  label:{fontSize:12,fontWeight:'800',color:colors.muted,marginBottom:5,marginLeft:3},
  h:{fontSize:17,fontWeight:'900',color:colors.text,marginTop:12,marginBottom:7},
  muted:{fontSize:11.5,color:colors.muted,marginTop:2},
  foodResult:{minHeight:52,backgroundColor:'#fff',borderRadius:15,paddingHorizontal:12,flexDirection:'row',alignItems:'center',gap:8,borderWidth:1,borderColor:colors.border,marginTop:7},
  foodName:{flex:1,color:colors.text,fontWeight:'800'},
  ingCard:{backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:12},
  ingTop:{flexDirection:'row',alignItems:'center',gap:8},
  remove:{width:38,height:38,alignItems:'center',justifyContent:'center'},
  ingControls:{flexDirection:'row',alignItems:'center',gap:8,marginTop:8},
  qty:{width:90,height:43,borderRadius:13,backgroundColor:'#F5F7F3',paddingHorizontal:11,color:colors.text,fontWeight:'900'},
  unitRow:{flexDirection:'row',gap:6},
  unit:{minWidth:49,height:37,paddingHorizontal:10,borderRadius:999,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'},
  unitOn:{backgroundColor:colors.sage,borderColor:colors.sage},
  unitText:{fontWeight:'800',fontSize:12,color:colors.text}
});
