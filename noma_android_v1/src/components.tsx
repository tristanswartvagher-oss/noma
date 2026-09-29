import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {Pressable,ScrollView,StyleSheet,Text,View,ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors,radius} from './theme';

export function Page({
  children,
  contentStyle,
  showsVerticalScrollIndicator=false
}:{
  children:React.ReactNode;
  contentStyle?:ViewStyle|ViewStyle[];
  showsVerticalScrollIndicator?:boolean;
}){
  return (
    <SafeAreaView edges={['top']} style={{flex:1,backgroundColor:colors.bg}}>
      <ScrollView
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.page,contentStyle]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function ScreenTitle({title,subtitle}:{title:string;subtitle?:string}){
  return <View style={{marginBottom:18}}>
    <Text style={s.title}>{title}</Text>
    {subtitle?<Text style={s.subtitle}>{subtitle}</Text>:null}
  </View>;
}

export function PrimaryButton({
  label,onPress,icon,disabled=false
}:{
  label:string;
  onPress:()=>void;
  icon?:keyof typeof Ionicons.glyphMap;
  disabled?:boolean;
}){
  return <Pressable disabled={disabled} onPress={onPress} style={[s.primary,disabled&&{opacity:.45}]}>
    {icon?<Ionicons name={icon} size={20} color="#fff"/>:null}
    <Text style={s.primaryText}>{label}</Text>
  </Pressable>;
}

export function Chip({label,active,onPress}:{label:string;active?:boolean;onPress?:()=>void}){
  return <Pressable onPress={onPress} style={[s.chip,active&&s.chipOn]}>
    <Text style={[s.chipText,active&&s.chipTextOn]}>{label}</Text>
  </Pressable>;
}

export function Stepper({
  value,onMinus,onPlus,label
}:{
  value:number;
  onMinus:()=>void;
  onPlus:()=>void;
  label?:string;
}){
  return <View style={s.stepWrap}>
    <Pressable accessibilityLabel="Diminuer" onPress={onMinus} style={s.stepButton}>
      <Ionicons name="remove" size={19} color={colors.sageDark}/>
    </Pressable>
    <View style={{minWidth:64,alignItems:'center'}}>
      <Text style={s.stepValue}>{value}</Text>
      {label?<Text style={s.stepLabel}>{label}</Text>:null}
    </View>
    <Pressable accessibilityLabel="Augmenter" onPress={onPlus} style={[s.stepButton,{backgroundColor:colors.sage}]}>
      <Ionicons name="add" size={19} color="#fff"/>
    </Pressable>
  </View>;
}

const s=StyleSheet.create({
  page:{paddingHorizontal:18,paddingTop:18,paddingBottom:36},
  title:{fontFamily:'Georgia',fontSize:40,lineHeight:45,fontWeight:'700',color:colors.text,letterSpacing:-1.2},
  subtitle:{marginTop:4,color:colors.muted,fontSize:15,lineHeight:21},
  primary:{minHeight:54,borderRadius:radius.pill,backgroundColor:colors.sage,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingHorizontal:18},
  primaryText:{color:'#fff',fontWeight:'900',fontSize:16},
  chip:{borderRadius:999,paddingVertical:8,paddingHorizontal:13,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border},
  chipOn:{backgroundColor:colors.sage,borderColor:colors.sage},
  chipText:{color:colors.text,fontWeight:'700',fontSize:13},
  chipTextOn:{color:'#fff'},
  stepWrap:{flexDirection:'row',alignItems:'center',gap:10},
  stepButton:{width:42,height:42,borderRadius:21,backgroundColor:colors.sageSoft,alignItems:'center',justifyContent:'center'},
  stepValue:{fontSize:22,fontWeight:'900',color:colors.text},
  stepLabel:{fontSize:11,color:colors.muted,marginTop:1}
});
