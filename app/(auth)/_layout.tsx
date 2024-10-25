import { Slot } from 'expo-router';
import { useFonts } from "expo-font";

export default function HomeLayout() {
  useFonts({
    'outfit':require('../../assets/fonts/Outfit-Regular.ttf'),
    'outfit-bold':require('../../assets/fonts/Outfit-Bold.ttf'),
    
  })
  
  return <Slot />;
}