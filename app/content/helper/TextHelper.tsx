import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Dimensions, ScrollView ,Text} from 'react-native';
import HTML from 'react-native-render-html';

interface TextHelperProps {
  content: string;
}

const TextHelper: React.FC<TextHelperProps> = ({ content }) => {
  const tagsStyles = {
    p: {
      marginTop: 5,
      marginBottom: 0,
      fontSize: 16,
      
      fontFamily: 'outfit',
    },
    h1: {
      marginTop: 10,
      marginBottom: 10,
      fontSize: 24,
      
      fontFamily: 'outfit',
    },
    // You can add more tag styles as needed
  };

  return (
    <ScrollView style={styles.container}>
      
      <HTML
        source={{ html: content }}
        contentWidth={Dimensions.get('window').width}
        tagsStyles={tagsStyles} // Apply custom styles
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: 'outfit',
  },


});

export default TextHelper;
