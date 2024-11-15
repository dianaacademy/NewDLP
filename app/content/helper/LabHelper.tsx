import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { ChapterDetails } from './Types'; // Import the ChapterDetails type

interface LabHelperProps {
  details: ChapterDetails;
}

const TOUCH_THRESHOLD = 30;
const FEEDBACK_DURATION = 2000;

const LabHelper: React.FC<LabHelperProps> = ({ details }) => {
  // Add error state
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTapLocation, setLastTapLocation] = useState<{ x: number; y: number } | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Validate required properties
  if (!details.imageUrl || !details.question || !details.answerArea) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Missing required lab content. Please contact support.
        </Text>
      </View>
    );
  }

  const isCorrectArea = (tapX: number, tapY: number) => {
    if (!details.answerArea) return false;
    
    const scaleFactor = {
      x: imageSize.width / Dimensions.get('window').width,
      y: imageSize.height / (imageSize.width * (3/4)),
    };

    const distance = Math.sqrt(
      Math.pow((tapX * scaleFactor.x - details.answerArea.x), 2) +
      Math.pow((tapY * scaleFactor.y - details.answerArea.y), 2)
    );

    return distance < TOUCH_THRESHOLD;
  };

  const animateFeedback = (success: boolean) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, FEEDBACK_DURATION);
    });
  };

  const handleImagePress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setLastTapLocation({ x: locationX, y: locationY });
    setAttempts(prev => prev + 1);

    if (isCorrectArea(locationX, locationY)) {
      setShowSuccess(true);
      animateFeedback(true);
    } else {
      animateFeedback(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{details.question}</Text>
      <Text style={styles.attempts}>Attempts: {attempts}</Text>

      <View style={styles.imageContainer}>
        <TouchableWithoutFeedback onPress={handleImagePress}>
          <Image
            source={{ uri: details.imageUrl }}
            style={styles.image}
            resizeMode="contain"
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setImageSize({ width, height });
            }}
          />
        </TouchableWithoutFeedback>

        {lastTapLocation && (
          <Animated.View
            style={[
              styles.feedback,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
                left: lastTapLocation.x - 15,
                top: lastTapLocation.y - 15,
              },
            ]}
          >
            {showSuccess ? (
              <Check size={30} color="#4CAF50" />
            ) : (
              <X size={30} color="#F44336" />
            )}
          </Animated.View>
        )}
      </View>

      <Modal
  transparent={true}
  visible={showSuccess}
  animationType="fade"
>
  <TouchableWithoutFeedback onPress={() => setShowSuccess(false)}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Check size={50} color="#4CAF50" />
        <Text style={styles.congratsText}>Congratulations!</Text>
        <Text style={styles.modalSubText}>
          You found the correct spot in {attempts} {attempts === 1 ? 'attempt' : 'attempts'}!
        </Text>
        {details.videoUrl && (
          <Text style={styles.videoPrompt}>
            Watch the explanation video to learn more!
          </Text>
        )}
      </View>
    </View>
  </TouchableWithoutFeedback>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: '#F44336',
    textAlign: 'center',
  },
  question: {
    fontSize: 20,
    fontFamily: 'outfit-bold',
    marginBottom: 16,
    color: '#333',
  },
  attempts: {
    fontSize: 16,
    fontFamily: 'outfit',
    marginBottom: 8,
    color: '#666',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 4/3,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  feedback: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  congratsText: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  modalSubText: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  videoPrompt: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LabHelper;