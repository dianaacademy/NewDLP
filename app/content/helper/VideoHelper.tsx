import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

interface VideoHelperProps {
  videoUrl: string;
}

const VideoHelper: React.FC<VideoHelperProps> = ({ videoUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <Video
        style={styles.video}
        source={{ uri: videoUrl }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        shouldPlay={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
  },
  video: {
    width: Dimensions.get('window').width - 32,
    height: 220,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
});

export default VideoHelper;