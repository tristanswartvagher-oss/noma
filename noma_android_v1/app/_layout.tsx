import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {AppProvider} from '@/src/store';
import {colors} from '@/src/theme';

export default function Root(){
  return (
    <AppProvider>
      <StatusBar style="dark"/>
      <Stack screenOptions={{
        headerShown:false,
        contentStyle:{backgroundColor:colors.bg},
        animation:'slide_from_right'
      }}>
        <Stack.Screen name="(tabs)"/>
        <Stack.Screen name="recipe/[id]"/>
        <Stack.Screen name="feedback/[id]" options={{presentation:'modal'}}/>
        <Stack.Screen name="pick-recipe" options={{presentation:'modal'}}/>
        <Stack.Screen name="meal-editor" options={{presentation:'modal'}}/>
        <Stack.Screen name="external-meal" options={{presentation:'modal'}}/>
        <Stack.Screen name="new-recipe" options={{presentation:'modal'}}/>
        <Stack.Screen name="schedule-recipe"/>
      </Stack>
    </AppProvider>
  );
}
