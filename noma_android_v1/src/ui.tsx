import {Ionicons} from '@expo/vector-icons';
import React,{useEffect,useState} from 'react';
import {Image,Pressable,StyleSheet,Text,View,ViewStyle} from 'react-native';
import {recipePhotoMap} from './recipeMedia';
import {colors,radius,shadow} from './theme';

type ArtworkProps={
  title:string;
  emoji:string;
  recipeId?:string;
  size?:number;
  style?:ViewStyle;
};
const palettes=[
  {bg:'#F8D5BE',plate:'#FFF3DB',edge:'#E2A783',dot:'#BA6D53'},
  {bg:'#F4D999',plate:'#FFFAE9',edge:'#D7AE54',dot:'#C37D4D'},
  {bg:'#DCE6C5',plate:'#FFF8E8',edge:'#A6BC91',dot:'#729160'},
  {bg:'#EACCD0',plate:'#FFF5EE',edge:'#CA9DA5',dot:'#B87377'},
  {bg:'#E2D5BF',plate:'#FFFAF0',edge:'#C1A47A',dot:'#997957'}
];
function platePalette(key:string){
  let hash=0;
  for(let i=0;i<key.length;i++)hash=(hash*31+key.charCodeAt(i))|0;
  return palettes[Math.abs(hash)%palettes.length];
}

export function RecipeArtwork({title,emoji,recipeId,size=72,style}:ArtworkProps){
  const [failed,setFailed]=useState(false);
  const uri=recipeId?recipePhotoMap[recipeId]:undefined;
  useEffect(()=>setFailed(false),[uri]);
  const pal=platePalette(recipeId||title);
  const canShow=Boolean(uri&&!failed);
  return <View style={[{
    width:size,height:size,borderRadius:Math.min(28,size*.23),
    backgroundColor:pal.bg,overflow:'hidden',alignItems:'center',justifyContent:'center'
  },style]}>
    {canShow?
      <Image accessibilityLabel={'Photo du plat '+title} source={{uri}} style={{width:'100%',height:'100%'}} resizeMode="cover" onError={()=>setFailed(true)}/>:
      <View accessible accessibilityLabel={'Illustration : '+title} style={{width:'100%',height:'100%',alignItems:'center',justifyContent:'center'}}>
        <View style={{position:'absolute',width:size*.9,height:size*.9,borderRadius:size*.45,borderWidth:size*.026,borderColor:pal.edge,backgroundColor:pal.plate,top:size*.055,left:size*.05}}/>
        <View style={{position:'absolute',width:size*.74,height:size*.74,borderRadius:size*.38,borderWidth:size*.012,borderColor:pal.edge,top:size*.13,left:size*.13}}/>
        <View style={{position:'absolute',height:size*.055,width:size*.055,borderRadius:size*.03,backgroundColor:pal.dot,top:size*.17,left:size*.16}}/>
        <View style={{position:'absolute',height:size*.04,width:size*.04,borderRadius:size*.03,backgroundColor:pal.dot,bottom:size*.16,right:size*.13}}/>
        <Text style={{fontSize:size*.34,textAlign:'center',includeFontPadding:false}}>{emoji}</Text>
        {size>=150?<Text style={{position:'absolute',bottom:10,right:15,fontSize:10,letterSpacing:.3,color:colors.muted}}>Illustration</Text>:null}
      </View>
    }
  </View>;
}
export function ProgressRing({percent,size=60,color=colors.sage}:{percent:number;size?:number;color?:string}){
  const clamped=Math.max(0,Math.min(100,percent));
  return <View accessible accessibilityLabel={Math.round(clamped)+' pour cent'} style={{
    width:size,height:size,borderRadius:size/2,borderWidth:size*.12,
    borderColor:colors.sageSoft,
    borderTopColor:clamped>=12?color:colors.sageSoft,
    borderRightColor:clamped>=37?color:colors.sageSoft,
    borderBottomColor:clamped>=62?color:colors.sageSoft,
    borderLeftColor:clamped>=87?color:colors.sageSoft,
    transform:[{rotate:'-45deg'}]
  }}/>;
}
export function SoftCard({children,style}:{children:React.ReactNode;style?:ViewStyle}){
  return <View style={[s.card,style]}>{children}</View>;
}
export function IconCircle({name,onPress,label}:{name:keyof typeof Ionicons.glyphMap;onPress:()=>void;label:string}){
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={s.circle}><Ionicons name={name} size={21} color={colors.text}/></Pressable>;
}
export function PageHeading({title,subtitle,action}:{title:string;subtitle?:string;action?:React.ReactNode}){
  return <View style={s.heading}>
    <View style={{flex:1}}>
      <View style={s.titleRow}><Text style={s.headingTitle}>{title}</Text><View style={s.accentDot}/></View>
      {subtitle?<Text style={s.subtitle}>{subtitle}</Text>:null}
    </View>
    {action}
  </View>;
}
export function Eyebrow({children}:{children:React.ReactNode}){
  return <Text style={s.eyebrow}>{children}</Text>;
}
const s=StyleSheet.create({
  card:{backgroundColor:colors.card,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,...shadow},
  circle:{width:48,height:48,borderRadius:24,backgroundColor:colors.card,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center',...shadow},
  heading:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:17},
  titleRow:{flexDirection:'row',alignItems:'baseline',gap:6},
  accentDot:{height:9,width:9,borderRadius:5,backgroundColor:colors.paprika},
  headingTitle:{fontSize:37,lineHeight:44,fontWeight:'900',color:colors.text,letterSpacing:-1.3},
  subtitle:{color:colors.muted,fontSize:13.5,marginTop:2,lineHeight:20},
  eyebrow:{color:colors.paprika,letterSpacing:1.1,fontSize:10.5,fontWeight:'900',textTransform:'uppercase'}
});
