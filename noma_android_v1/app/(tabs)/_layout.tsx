import {Ionicons} from '@expo/vector-icons';
import {Tabs} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '@/src/theme';

export default function TabsLayout(){
 const insets=useSafeAreaInsets();
 const bottom=Math.max(insets.bottom,12);
 return <Tabs screenOptions={{
  headerShown:false,tabBarHideOnKeyboard:true,
  tabBarActiveTintColor:colors.sageDark,tabBarInactiveTintColor:'#77848A',
  tabBarStyle:{backgroundColor:'#fff',borderTopColor:'#EEF0EB',height:57+bottom,paddingTop:8,paddingBottom:bottom,elevation:3},
  tabBarIconStyle:{marginBottom:1},tabBarLabelStyle:{fontSize:11,fontWeight:'700'}
 }}>
  <Tabs.Screen name="index" options={{title:'Semaine',tabBarIcon:({color,size})=><Ionicons name="calendar-outline" color={color} size={size}/>}}/>
  <Tabs.Screen name="recipes" options={{title:'Recettes',tabBarIcon:({color,size})=><Ionicons name="reader-outline" color={color} size={size}/>}}/>
  <Tabs.Screen name="groceries" options={{title:'Courses',tabBarIcon:({color,size})=><Ionicons name="cart-outline" color={color} size={size}/>}}/>
  <Tabs.Screen name="profile" options={{title:'Profil',tabBarIcon:({color,size})=><Ionicons name="person-outline" color={color} size={size}/>}}/>
 </Tabs>;
}
