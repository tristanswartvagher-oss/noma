import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {Alert,Pressable,StyleSheet,Switch,Text,TextInput,View} from 'react-native';
import {Page,ScreenTitle,Stepper} from '@/src/components';
import {useApp} from '@/src/store';
import {colors,radius} from '@/src/theme';

export default function Profile(){
  const {goals,setGoals,householdSize,setHouseholdSize,learning,foods,resetDemo}=useApp();
  const audited=foods.filter(f=>Boolean(f.auditStatus)).length;
  const review=foods.filter(f=>f.auditStatus==='review_external').length;
  const verified=foods.filter(f=>f.verified).length;

  return (
    <Page>
      <ScreenTitle title="Profil" subtitle="Seulement les réglages utiles."/>

      <View style={s.card}>
        <Text style={s.h}>Foyer</Text>
        <Text style={s.muted}>Nombre de portions à préparer par défaut.</Text>
        <View style={s.center}>
          <Stepper
            value={householdSize}
            label="personnes"
            onMinus={()=>setHouseholdSize(householdSize-1)}
            onPlus={()=>setHouseholdSize(householdSize+1)}
          />
        </View>
      </View>

      <View style={s.card}>
        <View style={s.toggle}>
          <View style={{flex:1}}>
            <Text style={s.h}>Macros</Text>
            <Text style={s.muted}>Calories, protéines, glucides et lipides dans ta semaine.</Text>
          </View>
          <Switch
            value={goals.enabled}
            onValueChange={enabled=>setGoals({enabled})}
            trackColor={{true:colors.sage,false:'#D7DDD5'}}
          />
        </View>

        {goals.enabled&&(
          <View style={s.grid}>
            {[
              ['kcal','kcal'],
              ['protein','g prot'],
              ['carbs','g gluc'],
              ['fat','g lip']
            ].map(([key,label])=>(
              <View key={key} style={s.target}>
                <TextInput
                  keyboardType="numeric"
                  value={String((goals as any)[key])}
                  onChangeText={value=>setGoals({[key]:Number(value)||0} as any)}
                  style={s.input}
                />
                <Text style={s.muted}>{label} / jour</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={[s.card,{backgroundColor:colors.sageSoft}]}>
        <View style={s.rowTitle}>
          <Ionicons name="sparkles-outline" size={22} color={colors.sageDark}/>
          <Text style={s.h}>Noma apprend</Text>
        </View>
        <Text style={s.muted}>
          {Object.keys(learning).length} recette(s) adaptée(s). Les recettes originales restent intactes et chaque ajustement peut être annulé dans la fiche recette.
        </Text>
      </View>

      <View style={s.card}>
        <View style={s.rowTitle}>
          <Ionicons name="nutrition-outline" size={22} color={colors.sageDark}/>
          <Text style={s.h}>Base nutritionnelle</Text>
        </View>
        <Text style={s.muted}>
          {foods.length} aliments locaux · {audited} audités · {review} à rapprocher d’une source externe · {verified} certifiés. Le calcul des recettes est vérifié ; la certification CIQUAL ligne par ligne reste à faire avant publication.
        </Text>
      </View>

      <View style={s.card}>
        <Text style={s.h}>Version</Text>
        <Text style={s.muted}>Noma 1.2.0 · schéma de données V3</Text>
      </View>

      <Pressable
        onPress={()=>Alert.alert(
          'Réinitialiser Noma ?',
          'Le planning, les recettes personnelles et les ajustements seront remplacés par les données de démonstration.',
          [
            {text:'Annuler',style:'cancel'},
            {text:'Réinitialiser',style:'destructive',onPress:resetDemo}
          ]
        )}
        style={s.reset}
      >
        <Ionicons name="refresh" size={18} color={colors.danger}/>
        <Text style={{fontWeight:'900',color:colors.danger}}>Réinitialiser les données</Text>
      </Pressable>
    </Page>
  );
}

const s=StyleSheet.create({
  card:{backgroundColor:'#fff',borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,padding:17,marginBottom:11},
  h:{fontSize:17,fontWeight:'900',color:colors.text},
  muted:{fontSize:12.5,color:colors.muted,marginTop:4,lineHeight:18},
  center:{alignItems:'center',marginTop:16},
  toggle:{flexDirection:'row',alignItems:'center',gap:12},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:9,marginTop:15},
  target:{width:'48%',backgroundColor:'#FAFBF8',borderRadius:18,padding:12},
  input:{fontSize:20,fontWeight:'900',color:colors.text,padding:0},
  rowTitle:{flexDirection:'row',alignItems:'center',gap:8},
  reset:{flexDirection:'row',gap:8,alignItems:'center',justifyContent:'center',padding:17}
});
