import {Ionicons} from '@expo/vector-icons';
import React,{useState} from 'react';
import {Image,Pressable,StyleSheet,Text,View,ViewStyle} from 'react-native';
import {colors,radius,shadow} from './theme';

// Les photos ne sont pas des donnees nutritionnelles. Une illustration locale reste
// disponible sans reseau ou si une photo n'est pas accessible.
const photos={
  salad:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=360&h=360&fit=crop&auto=format',
  pasta:'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=360&h=360&fit=crop&auto=format',
  bowl:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=360&h=360&fit=crop&auto=format',
  pancakes:'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=360&h=360&fit=crop&auto=format',
  toast:'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=360&h=360&fit=crop&auto=format'
};
function photoFor(title:string){
  const t=title.toLowerCase();
  if(/pancake|crêpe|crepe|gaufre/.test(t))return photos.pancakes;
  if(/tartine|toast/.test(t))return photos.toast;
  if(/pâte|pasta|spaghetti|lasagne|gnocchi/.test(t))return photos.pasta;
  if(/salade|tomate|avocat|taboulé|taboule/.test(t))return photos.salad;
  if(/bol|bowl|quinoa|riz|lentille|curry|poulet|saumon|porridge/.test(t))return photos.bowl;
  return undefined;
}
export function RecipeArtwork({title,emoji,size=72,style}:{title:string;emoji:string;size?:number;style?:ViewStyle}){
  const [failed,setFailed]=useState(false);
  const uri=photoFor(title);
  return <View style={[{width:size,height:size,borderRadius:16,backgroundColor:colors.beige,overflow:'hidden',alignItems:'center',justifyContent:'center'},style]}>
    {uri&&!failed?<Image accessibilityLabel={title} source={{uri}} onError={()=>setFailed(true)} style={{width:'100%',height:'100%'}} resizeMode="cover"/>:<Text style={{fontSize:size*.43}}>{emoji}</Text>}
  </View>;
}
export function ProgressRing({percent,size=60,color=colors.sage}:{percent:number;size?:number;color?:string}){
  const clamped=Math.max(0,Math.min(100,percent));
  return <View accessible accessibilityLabel={Math.round(clamped)+' pour cent'} style={{width:size,height:size,borderRadius:size/2,borderWidth:size*.12,borderColor:colors.sageSoft,borderTopColor:clamped>=12?color:colors.sageSoft,borderRightColor:clamped>=37?color:colors.sageSoft,borderBottomColor:clamped>=62?color:colors.sageSoft,borderLeftColor:clamped>=87?color:colors.sageSoft,transform:[{rotate:'-45deg'}]}}/>;
}
export function SoftCard({children,style}:{children:React.ReactNode;style?:ViewStyle}){
  return <View style={[s.card,style]}>{children}</View>;
}
export function IconCircle({name,onPress,label}:{name:keyof typeof Ionicons.glyphMap;onPress:()=>void;label:string}){
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={s.circle}><Ionicons name={name} size={20} color={colors.text}/></Pressable>;
}
export function PageHeading({title,subtitle,action}:{title:string;subtitle?:string;action?:React.ReactNode}){
  return <View style={s.heading}><View style={{flex:1}}><Text style={s.headingTitle}>{title}</Text>{subtitle?<Text style={s.subtitle}>{subtitle}</Text>:null}</View>{action}</View>;
}
const s=StyleSheet.create({
  card:{backgroundColor:colors.card,borderRadius:radius.lg,borderWidth:1,borderColor:'#F0F2EC',...shadow},
  circle:{width:43,height:43,borderRadius:24,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center',...shadow},
  heading:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:16},
  headingTitle:{fontSize:36,lineHeight:41,fontWeight:'800',color:colors.text,letterSpacing:-1.25},
  subtitle:{color:colors.muted,fontSize:13,marginTop:3,lineHeight:19}
});
