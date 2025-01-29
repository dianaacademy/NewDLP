import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getFirestore, doc, getDoc, collection, getDocs, CollectionReference } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { ChevronLeft, FileStack } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { auth } from '@/firebaseConfig';

interface Module {
  id: string;
  moduleno: number;
  moduleName: string;
  totalChapters: number;
  type: string;
}

interface CourseData {
  courseName: string;
  thumbnailUrl: string;
  courseDesc: string;
  tutorName: string;
  modules: Module[];
}

const Learning: React.FC = () => {
  const { courseId } = useLocalSearchParams();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [showMoreCourseDesc, setShowMoreCourseDesc] = useState(false);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [totalChapters, setTotalChapters] = useState(0);
  const db = getFirestore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if (typeof courseId === 'string') {
          const courseRef = doc(db, 'courses', courseId);
          const courseSnapshot = await getDoc(courseRef);
  
          if (courseSnapshot.exists()) {
            const data = courseSnapshot.data() as CourseData;
            const modulesCollectionRef = collection(db, 'courses', courseId, 'modules') as CollectionReference<Module>;
            const modulesSnapshot = await getDocs(modulesCollectionRef);
  
            const modulesData = await Promise.all(
              modulesSnapshot.docs.map(async (moduleDoc) => {
                const moduleData = moduleDoc.data();
                const chaptersCollectionRef = collection(db, 'courses', courseId, 'modules', moduleDoc.id, 'chapters');
                const chaptersSnapshot = await getDocs(chaptersCollectionRef);
  
                return {
                  id: moduleDoc.id,
                  moduleno: moduleData.moduleno,
                  moduleName: moduleData.moduleName,
                  totalChapters: chaptersSnapshot.docs.length,
                  type: moduleData.type,
                };
              })
            );
  
            setCourseData({
              ...data,
              modules: modulesData.sort((a, b) => a.moduleno - b.moduleno),
            });

            // Fetch total chapters and completed chapters
            const allChapters = modulesData.reduce((total, module) => total + module.totalChapters, 0);
            setTotalChapters(allChapters);
            await fetchCompletedChapters();
          } else {
            console.log('No such course document!');
          }
        } else {
          console.log('Invalid courseId:', courseId);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const fetchCompletedChapters = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser && typeof courseId === 'string') {
          const userProgressRef = doc(
            db, 
            'users', 
            currentUser.uid, 
            'progress', 
            courseId
          );
    
          const userProgressSnapshot = await getDoc(userProgressRef);
          if (userProgressSnapshot.exists()) {
            const userData = userProgressSnapshot.data();
            setCompletedChapters(userData.completedChapters || []);
          }
        }
      } catch (error) {
        console.error('Error fetching completed chapters:', error);
      }
    };
  
    fetchCourseData();
  }, [courseId]);

  const handleBackPress = () => {
    router.back();
  };

  const handleViewChapter = (moduleId: string) => {
    router.push(`/content/ViewCourse?moduleId=${moduleId}&courseId=${courseId}` as any);
  };

  const calculateCourseCompletion = () => {
    const completionPercentage = totalChapters > 0 
      ? Math.round((completedChapters.length / totalChapters) * 100) 
      : 0;
    return completionPercentage;
  };

  const CourseCompletionCircle = () => {
    const radius = 15;
    const strokeWidth = 4;
    const circumference = 2 * Math.PI * radius;
    const completionPercentage = calculateCourseCompletion();
    const dashOffset = circumference - (completionPercentage / 100) * circumference;
  
    return (
      <View style={styles.courseCompletionContainer}>
        <Svg width={40} height={40}>
          <Circle
            cx={20}
            cy={20}
            r={radius}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={20}
            cy={20}
            r={radius}
            fill="none"
            stroke="#007AFF"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </Svg>
        <Text style={styles.completionPercentage}>{completionPercentage}%</Text>
      </View>
    );
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
        <ChevronLeft size={24} color="#333" />
      </TouchableOpacity>
      {courseData && (
        <>
          <View style={styles.headerContainer}>
            <Image source={{ uri: courseData.thumbnailUrl }} style={styles.thumbnailUrl} />
            
          </View>
          <Text style={styles.title}>{courseData.courseName}</Text>
          <Text style={styles.tutor}>By {courseData.tutorName}</Text>
          <Text style={styles.courseDesc}>
            {courseData.courseDesc.slice(0, 120)}
            {courseData.courseDesc.length > 120 && (
              <Text
                style={styles.seeMore}
                onPress={() => setShowMoreCourseDesc(!showMoreCourseDesc)}
              >
                {showMoreCourseDesc ? ' See less' : ' See more'}
              </Text>
            )}
            {showMoreCourseDesc && courseData.courseDesc.slice(120)}
          </Text>
          <View style={styles.sectionTitleContainer}>
  <Text style={styles.sectionTitle}>Course Contents</Text>
  <CourseCompletionCircle />
</View>
          {courseData.modules.map((module) => (
            <TouchableOpacity
              key={module.id}
              onPress={() => handleViewChapter(module.id)}
            >
              <View style={styles.moduleContainer}>
                <Text style={styles.moduleno}>{module.moduleno}</Text>
                <View style={styles.moduleContentContainer}>
                  <Text style={styles.moduleTitle}>
                    {module.moduleName} - {module.totalChapters} Chapters
                  </Text>
                  {module.type === 'video' ? <FileStack size={24} color="#333" /> : <FileStack size={24} color="#333" />}
                </View>
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
    paddingTop: 30,
    paddingBottom: 40,
  },
  sectionTitleContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseCompletionContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionPercentage: {
    position: 'absolute',
    fontSize: 10,
    fontFamily: 'outfit-bold',
    color: '#007AFF',
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
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailUrl: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginVertical: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    fontFamily: 'outfit-bold',
  },
  tutor: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'outfit',
    marginBottom: 16,
  },
  courseDesc: {
    fontSize: 16,
    fontFamily: 'outfit',
    lineHeight: 24,
    marginBottom: 16,
  },
  seeMore: {
    color: '#007AFF',
    fontFamily: 'outfit',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    marginVertical: 16,
  },
  moduleContainer: {
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    
    marginVertical: 5,
    
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleno: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    marginRight: 16,
    textAlign: 'center',
    width: 32,
    color: '#000',
  },
  moduleContentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 16,
    fontFamily: 'outfit',
    flex: 1,
    marginRight: 8,
  },
});

export default Learning;