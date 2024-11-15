import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity,ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getFirestore, doc, getDoc, collection, getDocs, CollectionReference, QuerySnapshot } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { ChevronLeft,FileStack} from 'lucide-react-native';


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
          } else {
            console.log('No such course document!');
          }
        } else {
          console.log('Invalid courseId:', courseId);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        // Ensure loading is set to false at the end
        setLoading(false);
      }
    };
  
    fetchCourseData();
  }, [courseId]);
  

  const handleBackPress = () => {
    router.back();
  };

  const handleViewChapter = (moduleId: string) => {
    router.push(`/content/ViewCourse?moduleId=${moduleId}&courseId=${courseId}`as any);
    console.log(`content/ViewCourse?moduleId=${moduleId}&courseId=${courseId}`)
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
          <Image source={{ uri: courseData.thumbnailUrl }} style={styles.thumbnailUrl} />
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
          <Text style={styles.sectionTitle}>Course Contents</Text>
          {courseData.modules.map((module) => (
            <TouchableOpacity
            key={module.id}
            onPress={() => handleViewChapter(module.id)}>
            <View key={module.id} style={styles.moduleContainer}>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left:0,
    zIndex: 1,
    borderRadius:50,
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
    marginBottom: 12,
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