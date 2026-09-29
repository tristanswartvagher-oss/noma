import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import React,{useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {Page,PrimaryButton} from '@/src/components';
import {useApp} from '@/src/store';
import {colors,radius} from '@/src/theme';

export default function Feedback(){
  const {id}=useLocalSearchParams<{id:string}>();
  const {recipes,foods,saveFeedback}=useApp();
  const recipe=recipes.find(r=>r.id===id);
  const [quantity,setQuantity]=useState<'low'|'perfect'|'high'>('perfect');
  const [rating,setRating]=useState(4);
  const [note,setNote]=useState('');
  const [adjustments,setAdjustments]=useState<Record<string,number>>({});

  if(!recipe){
    return <Page><Text style={s.title}>Recette introuvable</Text><PrimaryButton label="Fermer" onPress={()=>router.back()}/></Page>;
  }

  const globalText=quantity==='low'
    ? 'Noma augmentera toute la recette de 8 %.'
    : quantity==='high'
      ? 'Noma réduira toute la recette de 8 %.'
      : 'La quantité globale ne changera pas.';

  return (
    <Page>
      <Pressable onPress={()=>router.back()} style={s.close}>
        <Ionicons name="close" size={24} color={colors.text}/>
      </Pressable>

      <Text style={s.title}>Après le repas</Text>
      <Text style={s.sub}>Ton retour est privé et modifie uniquement ta version de la recette.</Text>

      <View style={s.recipe}>
        <Text style={{fontSize:34}}>{recipe.emoji}</Text>
        <View>
          <Text style={s.rname}>{recipe.title}</Text>
          <Text style={s.muted}>Noma conserve toujours l’original.</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.h}>Quantité globale</Text>
        <Text style={s.muted}>Est-ce que la quantité préparée te convenait ?</Text>

        <View style={s.pills}>
          {[
            ['low','Pas assez'],
            ['perfect','Parfait'],
            ['high','Trop']
          ].map(([value,label])=>(
            <Pressable
              key={value}
              onPress={()=>setQuantity(value as 'low'|'perfect'|'high')}
              style={[s.pill,quantity===value&&s.pillOn]}
            >
              <Text style={[s.pillT,quantity===value&&{color:'#fff'}]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.info}>{globalText}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.h}>Ajuster un ingrédient</Text>
        <Text style={s.muted}>Optionnel. Ces changements s’ajoutent à l’ajustement global.</Text>

        {recipe.ingredients.map(ing=>{
          const food=foods.find(f=>f.id===ing.foodId);
          if(!food) return null;
          const value=adjustments[ing.foodId]||0;
          return (
            <View key={ing.foodId} style={s.ing}>
              <Text style={{flex:1,color:colors.text}}>{food.name}</Text>
              <Pressable
                style={s.tiny}
                onPress={()=>setAdjustments(a=>({...a,[ing.foodId]:Math.max(-.3,(a[ing.foodId]||0)-.1)}))}
              >
                <Ionicons name="remove" size={15} color={colors.sageDark}/>
              </Pressable>
              <Text style={s.adj}>{value>0?'+':''}{Math.round(value*100)}%</Text>
              <Pressable
                style={s.tiny}
                onPress={()=>setAdjustments(a=>({...a,[ing.foodId]:Math.min(.5,(a[ing.foodId]||0)+.1)}))}
              >
                <Ionicons name="add" size={15} color={colors.sageDark}/>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={s.card}>
        <Text style={s.h}>Ta note</Text>
        <View style={s.stars}>
          {[1,2,3,4,5].map(n=>(
            <Pressable key={n} onPress={()=>setRating(n)}>
              <Ionicons name={n<=rating?'star':'star-outline'} size={29} color={colors.sage}/>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.h}>Note perso</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Ex. plus épicé, 5 min de moins au four…"
          placeholderTextColor={colors.muted}
          style={s.input}
        />
      </View>

      <PrimaryButton
        label="Enregistrer"
        onPress={()=>{saveFeedback(id,quantity,rating,note,adjustments);router.back();}}
      />
    </Page>
  );
}

const s=StyleSheet.create({
  close:{alignSelf:'flex-end',width:44,height:44,alignItems:'center',justifyContent:'center'},
  title:{fontFamily:'Georgia',fontSize:38,fontWeight:'700',color:colors.text},
  sub:{color:colors.muted,fontSize:14,marginTop:4,marginBottom:14,lineHeight:20},
  recipe:{flexDirection:'row',gap:10,alignItems:'center',marginBottom:10},
  rname:{fontSize:18,fontWeight:'900',color:colors.text},
  muted:{fontSize:12.5,color:colors.muted,marginTop:3,lineHeight:18},
  card:{backgroundColor:'#fff',borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,padding:16,marginBottom:10},
  h:{fontSize:16,fontWeight:'900',color:colors.text},
  pills:{flexDirection:'row',gap:7,marginTop:12},
  pill:{flex:1,borderRadius:999,borderWidth:1,borderColor:colors.border,paddingVertical:10,alignItems:'center'},
  pillOn:{backgroundColor:colors.sage,borderColor:colors.sage},
  pillT:{fontWeight:'800',color:colors.text,fontSize:13},
  info:{fontSize:11.5,color:colors.sageDark,fontWeight:'800',marginTop:10},
  ing:{minHeight:47,borderTopWidth:1,borderTopColor:'#F0F2EE',flexDirection:'row',alignItems:'center',gap:7},
  tiny:{width:30,height:30,borderRadius:15,backgroundColor:colors.sageSoft,alignItems:'center',justifyContent:'center'},
  adj:{minWidth:42,textAlign:'center',fontWeight:'900',color:colors.text},
  stars:{flexDirection:'row',gap:8,marginTop:10},
  input:{minHeight:82,borderRadius:16,backgroundColor:'#F5F7F3',padding:12,marginTop:10,color:colors.text,textAlignVertical:'top'}
});
