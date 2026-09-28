import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {colors,radius} from './theme';

export function ScreenTitle({title,subtitle}:{title:string;subtitle?:string}){
 return <View style={{marginBottom:18}}><Text style={s.title}>{title}</Text>{subtitle?<Text style={s.subtitle}>{subtitle}</Text>:null}</View>
}
export function PrimaryButton({label,onPress,icon}:{label:string;onPress:()=>void;icon?:keyof typeof Ionicons.glyphMap}){
 return <Pressable onPress={onPress} style={s.primary}>{icon?<Ionicons name={icon} size={20} color="#fff"/>:null}<Text style={s.primaryText}>{label}</Text></Pressable>
}
export function Chip({label,active,onPress}:{label:string;active?:boolean;onPress?:()=>void}){
 return <Pressable onPress={onPress} style={[s.chip,active&&s.chipOn]}><Text style={[s.chipText,active&&s.chipTextOn]}>{label}</Text></Pressable>
}
const s=StyleSheet.create({
 title:{fontFamily:'Georgia',fontSize:40,lineHeight:45,fontWeight:'700',color:colors.text,letterSpacing:-1.2},
 subtitle:{marginTop:4,color:colors.muted,fontSize:15,lineHeight:21},
 primary:{minHeight:54,borderRadius:radius.pill,backgroundColor:colors.sage,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingHorizontal:18},
 primaryText:{color:'#fff',fontWeight:'900',fontSize:16},
 chip:{borderRadius:999,paddingVertical:8,paddingHorizontal:13,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border},
 chipOn:{backgroundColor:colors.sage,borderColor:colors.sage},
 chipText:{color:colors.text,fontWeight:'700',fontSize:13},chipTextOn:{color:'#fff'}
});
