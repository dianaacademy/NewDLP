import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useLocalSearchParams,useRouter } from 'expo-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import TextHelper from './helper/TextHelper';
import QuizHelper from './helper/QuizHelper';
import VideoHelper from './helper/VideoHelper';
import LabHelper from './helper/LabHelper';
import { Chapter } from './helper/Types';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const ViewChapter: React.FC = () => {
  const route = useRoute();
  const { TotalChapter } = useLocalSearchParams();
  const navigation = useNavigation();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const db = getFirestore();
  const totalChapters = Number(TotalChapter);
  const router = useRouter();

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        const { moduleId, courseId, chapterId } = route.params as {
          moduleId: string;
          courseId: string;
          chapterId: string;
        };
        const chapterRef = doc(db, 'courses', courseId, 'modules', moduleId, 'chapters', chapterId);
        const chapterSnapshot = await getDoc(chapterRef);

        if (chapterSnapshot.exists()) {
          const chapterData = chapterSnapshot.data();
          setChapter({
            id: chapterSnapshot.id,
            chapterno: chapterData.chapterno,
            chapterName: chapterData.chapterName,
            type: chapterData.type,
            content: chapterData.details?.content || '',
            details: chapterData.details || {}
          });
          setCurrentChapterIndex(chapterData.chapterno - 1);
        } else {
          console.log('No such chapter document!');
        }
      } catch (error) {
        console.error('Error fetching chapter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [route.params]);

  const handlePreviousPress = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      // Navigate to the previous chapter
    }
  };

  const handleNextPress = () => {
    if (currentChapterIndex < totalChapters - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      // Navigate to the next chapter
    }
  };
  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    );
  }

  if (!chapter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.text}>No chapter data found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {Array.from({ length: totalChapters }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressLine,
              index < currentChapterIndex ? styles.completedProgress : index === currentChapterIndex ? styles.currentProgress : styles.futureProgress,
            ]}
          />
        ))}
      </View>

      <View style={styles.headingContainer}>
     <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
    <ChevronLeft size={24} color="#333" />
     </TouchableOpacity>
     <Text style={styles.chapterHeading}>{chapter.chapterName}</Text>
    </View>


      <ScrollView style={styles.contentContainer}>
        {chapter.type === 'text' && <TextHelper content={chapter.content} />}
        {chapter.type === 'quiz' && chapter.details?.questions && (
          <QuizHelper details={{ questions: chapter.details.questions }} />
        )}
        {chapter.type === 'video' && chapter.details?.videoUrl && (
          <VideoHelper videoUrl={chapter.details.videoUrl} />
        )}
        {chapter.type === 'lab' && chapter.details && 
         chapter.details.imageUrl && 
         chapter.details.question && 
         chapter.details.answerArea && (
           <LabHelper details={chapter.details} />
        )}
      </ScrollView>

      {/* <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navButton} onPress={handlePreviousPress}>
          <ChevronLeft size={30} color="#333" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleNextPress}>
          <Text style={styles.navButtonText}>Next</Text>
          <ChevronRight size={30} color="#333" />
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Vertically centers the content
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 0,
    zIndex: 1,
    borderRadius: 50,
    backgroundColor: '#fff',
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 10,
    paddingTop: 30,
  },
  progressLine: {
    flex: 1,
    height: 4,
    marginHorizontal: 2,
  },
  completedProgress: {
    backgroundColor: '#0000ff',
  },
  currentProgress: {
    backgroundColor: '#0000ff',
  },
  futureProgress: {
    backgroundColor: '#ccc',
  },
  chapterHeading: {
    fontSize: 24,
    paddingLeft:40,
    marginHorizontal: 16,
    marginVertical: 8,
    fontFamily: 'outfit-bold',
    
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },



  text: {
    fontFamily: 'outfit',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'outfit',
    marginHorizontal: 8,
  },
});

export default ViewChapter;