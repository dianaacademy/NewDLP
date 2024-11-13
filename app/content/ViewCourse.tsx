import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getFirestore, doc, getDoc, collection, getDocs, CollectionReference } from 'firebase/firestore';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { auth } from '@/firebaseConfig';

interface Chapter {
  id: string;
  chapterno: number;
  chapterName: string;
  type: 'text' | 'video' | 'quiz' | 'match' | 'lab';
  completed: boolean;
}

interface Module {
  id: string;
  moduleno: number;
  moduleName: string;
  chapters: Chapter[];
}

const ViewCourse: React.FC = () => {
  const { moduleId, courseId } = useLocalSearchParams();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const db = getFirestore();
  
  const router = useRouter();

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        if (typeof moduleId === 'string' && typeof courseId === 'string') {
          const moduleRef = doc(db, 'courses', courseId, 'modules', moduleId);
          const moduleSnapshot = await getDoc(moduleRef);

          if (moduleSnapshot.exists()) {
            const moduleData = moduleSnapshot.data() as Module;
            const chaptersCollectionRef = collection(db, 'courses', courseId, 'modules', moduleId, 'chapters') as CollectionReference<Chapter>;
            const chaptersSnapshot = await getDocs(chaptersCollectionRef);

            const completedChapters = await getCompletedChapters();

            const chaptersData = chaptersSnapshot.docs.map((chapterDoc) => {
              const chapterData = chapterDoc.data();
              return {
                id: chapterDoc.id,
                chapterno: chapterData.chapterno,
                chapterName: chapterData.chapterName,
                type: chapterData.type,
                completed: completedChapters.includes(chapterDoc.id),
              };
            });

            setModule({
              ...moduleData,
              chapters: chaptersData.sort((a, b) => a.chapterno - b.chapterno),
            });
          } else {
            console.log('No such module document!');
          }
        } else {
          console.log('Invalid moduleId or courseId:', moduleId, courseId);
        }
      } catch (error) {
        console.error('Error fetching module data:', error);
      } finally {
        setLoading(false);
      }
    };

    const getCompletedChapters = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Ensure the path is correct and the arguments match expected types.
          const userProgressRef = doc(
            db,
            'users',
            currentUser.uid,
            'progress',
            courseId as string // Ensure `courseId` is a string
          );
    
          const userProgressSnapshot = await getDoc(userProgressRef);
          if (userProgressSnapshot.exists()) {
            const userData = userProgressSnapshot.data();
            return userData.completedChapters || [];
          }
        }
        return [];
      } catch (error) {
        console.error('Error fetching completed chapters:', error);
        return [];
      }
    };

    fetchModuleData();
  }, [moduleId, courseId]);

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>
      {module && (
        <>
          <Text style={styles.moduleTitle}>{module.moduleName}</Text>
          {module.chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter.id}
              style={[
                styles.chapterContainer,
                chapter.completed && styles.completedChapter,
              ]}
            >
              <Text style={styles.chapterno}>{chapter.chapterno}</Text>
              <View style={styles.chapterContentContainer}>
                <Text style={styles.chapterName}>{chapter.chapterName}</Text>
                {chapter.completed ? (
                  <Feather name="check" size={24} color="#4CAF50" />
                ) : (
                  <FontAwesome
                    name={
                      chapter.type === 'video'
                        ? 'video-camera'
                        : chapter.type === 'quiz'
                        ? 'question-circle'
                        : chapter.type === 'match'
                        ? 'th-large'
                        : chapter.type === 'lab'
                        ? 'flask'
                        : 'file-text'
                    }
                    size={24}
                    color="#333"
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 35,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  moduleTitle: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    marginBottom: 16,
    marginTop: 25,
    marginLeft: 60,
  },
  chapterContainer: {
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedChapter: {
    backgroundColor: '#e8f5e9',
  },
  chapterno: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    marginRight: 16,
    textAlign: 'center',
    width: 32,
    color: '#000',
  },
  chapterContentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterName: {
    fontSize: 16,
    fontFamily: 'outfit',
    flex: 1,
    marginRight: 8,
  },
});

export default ViewCourse;
