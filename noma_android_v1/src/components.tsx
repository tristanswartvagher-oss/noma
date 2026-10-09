import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {Pressable,ScrollView,StyleSheet,Text,View,ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors,radius,shadow} from './theme';

export function Page({children,contentStyle,showsVerticalScrollIndicator=false}:{
 children:React.ReactNode;contentStyle?:ViewStyle|ViewStyle[];showsVerticalScrollIndicator?:boolean;
}){
 return <SafeAreaView edges={['top']} style={{flex:1,backgroundColor:colors.bg}}>
  <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={showsVerticalScrollIndicator} contentContainerStyle={[s.page,contentStyle]}>{children}</ScrollView>
 </SafeAreaView>;
}
export function ScreenTitle({title,subtitle}:{title:string;subtitle?:string}){
 return <View style={{marginBottom:18}}><Text style={s.title}>{title}</Text>{subtitle?<Text style={s.subtitle}>{subtitle}</Text>:null}</View>;
}
export function PrimaryButton({label,onPress,icon,disabled=false}:{label:string;onPress:()=>void;icon?:keyof typeof Ionicons.glyphMap;disabled?:boolean}){
 return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[s.primary,disabled&&{opacity:.45}]}>
  {icon?<Ionicons name={icon} size={20} color="#fff"/>:null}<Text style={s.primaryText}>{label}</Text>
 </Pressable>;
}
export function Chip({label,active,onPress}:{label:string;active?:boolean;onPress?:()=>void}){
 return <Pressable accessibilityRole="button" accessibilityState={{selected:!!active}} onPress={onPress} style={[s.chip,active&&s.chipOn]}>
  <Text style={[s.chipText,active&&s.chipTextOn]}>{label}</Text>
 </Pressable>;
}
export function Stepper({value,onMinus,onPlus,label}:{value:number;onMinus:()=>void;onPlus:()=>void;label?:string}){
 return <View style={s.stepWrap}>
  <Pressable accessibilityLabel="Diminuer" onPress={onMinus} style={s.stepButton}><Ionicons name="remove" size={19} color={colors.sageDark}/></Pressable>
  <View style={{minWidth:54,alignItems:'center'}}><Text style={s.stepValue}>{value}</Text>{label?<Text style={s.stepLabel}>{label}</Text>:null}</View>
  <Pressable accessibilityLabel="Augmenter" onPress={onPlus} style={[s.stepButton,{backgroundColor:colors.sage}]}><Ionicons name="add" size={19} color="#fff"/></Pressable>
 </View>;
}
const s=StyleSheet.create({
 page:{paddingHorizontal:18,paddingTop:20,paddingBottom:44},
 title:{fontSize:36,lineHeight:42,fontWeight:'800',color:colors.text,letterSpacing:-1.3},
 subtitle:{marginTop:3,color:colors.muted,fontSize:13.5,lineHeight:20},
 primary:{minHeight:52,borderRadius:radius.pill,backgroundColor:colors.sageDark,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingHorizontal:18,...shadow},
 primaryText:{color:'#fff',fontWeight:'800',fontSize:15},
 chip:{borderRadius:999,paddingVertical:10,paddingHorizontal:15,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border},
 chipOn:{backgroundColor:colors.sage,borderColor:colors.sage},
 chipText:{color:colors.text,fontWeight:'700',fontSize:12.5},
 chipTextOn:{color:'#fff'},
 stepWrap:{flexDirection:'row',alignItems:'center',gap:7},
 stepButton:{width:37,height:37,borderRadius:20,backgroundColor:colors.sageSoft,alignItems:'center',justifyContent:'center'},
 stepValue:{fontSize:19,fontWeight:'800',color:colors.text},
 stepLabel:{fontSize:11,color:colors.muted,marginTop:1}
});
