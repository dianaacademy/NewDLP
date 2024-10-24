import { SafeAreaView, StyleSheet } from 'react-native';

// Components
import { HeaderAuth } from '@/components/export';
import { View , Text } from 'react-native';
import tw from 'twrnc';



export default function Home() {
  return (
    <SafeAreaView style={styles.container}>

      <View >
        <Text style={tw`flex-row mt-10 px-2  text-2xl items-center justify-between mb-4`}>
         Dashboard
        </Text>
      </View>
      {/* <HeaderAuth /> */}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  }
})