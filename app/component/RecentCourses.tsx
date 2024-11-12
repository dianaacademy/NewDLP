import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebaseConfig';

interface Course {
  id: string;
  courseName: string;
  thumbnailUrl: string;
  lessons: number;
  category: string;
}

const AllCourses5: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const coursesSnapshot = await getDocs(collection(firestore, 'courses'));
        const coursesList: Course[] = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];

        // Select 5 random courses
        const randomCourses = coursesList.sort(() => 0.5 - Math.random()).slice(0, 5);
        setCourses(randomCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const renderCourseItem = ({ item }: { item: Course }) => (
    <View style={styles.courseCard}>
      <Image
        source={{
          uri: item.thumbnailUrl || 'https://ik.imagekit.io/growthx100/default-image.jpg',
        }}
        style={styles.courseImage}
      />
      <Text style={styles.courseTitle}>
        {item.courseName.length > 25 ? `${item.courseName.slice(0, 25)}...` : item.courseName}
      </Text>
      <TouchableOpacity style={styles.resumeButton}>
        <Text style={styles.resumeText}>Explore</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  courseCard: {
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    marginBottom:20,
  },
  courseImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  courseTitle: {
    fontSize: 14,
    fontFamily: 'outfit',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  resumeButton: {
    marginTop: 5,
    backgroundColor: '#D2E3FC',
    paddingVertical: 8,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 8,
    fontFamily: 'outfit-bold',
    marginHorizontal: 8,

  },
  resumeText: {
    color: '#174EA6',
    fontFamily: 'outfit-bold',
    fontSize: 15,
  },
});

export default AllCourses5;
