import {Ionicons} from '@expo/vector-icons';import {Tabs} from 'expo-router';import {colors} from '@/src/theme';
export default function TabsLayout(){return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:colors.sageDark,tabBarInactiveTintColor:'#8A9490',tabBarStyle:{backgroundColor:'#fff',borderTopColor:'#EEF0EB',height:82,paddingTop:8,paddingBottom:16},tabBarLabelStyle:{fontSize:12,fontWeight:'700'}}}>
<Tabs.Screen name="index" options={{title:'Semaine',tabBarIcon:({color,size})=><Ionicons name="calendar-outline" color={color} size={size}/>}}/>
<Tabs.Screen name="recipes" options={{title:'Recettes',tabBarIcon:({color,size})=><Ionicons name="reader-outline" color={color} size={size}/>}}/>
<Tabs.Screen name="groceries" options={{title:'Courses',tabBarIcon:({color,size})=><Ionicons name="cart-outline" color={color} size={size}/>}}/>
<Tabs.Screen name="profile" options={{title:'Profil',tabBarIcon:({color,size})=><Ionicons name="person-outline" color={color} size={size}/>}}/>
</Tabs>}
