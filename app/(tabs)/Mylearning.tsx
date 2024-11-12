import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebaseConfig';
import { useRouter } from 'expo-router';

interface Course {
  id: string;
  courseName: string;
  thumbnailUrl: string;
  lessons: number;
  category: string;
}

const AllCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedCategories, setDisplayedCategories] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const handleView = () => {
    router.push('/(tabs)/Mylearning');
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const coursesSnapshot = await getDocs(collection(firestore, 'courses'));
        const coursesList: Course[] = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        setCourses(coursesList);
        
        // Initial categories to display (up to 3)
        const initialCategories = Array.from(new Set(coursesList.map(course => course.category))).slice(0, 3);
        setDisplayedCategories(initialCategories);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleLoadMore = () => {
    if (!expanded) {
      const additionalCategories = Array.from(new Set(courses.map(course => course.category))).slice(3);
      setDisplayedCategories([...displayedCategories, ...additionalCategories]);
    }
    setExpanded(true);
  };

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

  const renderCategory = (category: string) => (
    
    <View key={category} style={styles.categoryContainer}>
      
      <Text style={styles.categoryTitle}>{category}</Text>
      <FlatList
        data={courses.filter(course => course.category === category)}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
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
    <ScrollView showsVerticalScrollIndicator={false}>
    <View style={styles.container}>
    <TouchableOpacity onPress={handleView} >
                <View style={styles.imageSection}>
        <Image style={styles.imageBanner} source={require('../../assets/images/Banner.png')} 
          
        />
      </View>
      </TouchableOpacity>
      {displayedCategories.map(renderCategory)}
      {!expanded && (
        <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}
    </View>
    </ScrollView>
    
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
  categoryContainer: {
    
  },
  categoryTitle: {
    marginLeft:16,
    margin:16,
    fontSize: 23,
    fontFamily: 'outfit-bold',
    marginBottom: 8,
    
    
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
    marginBottom:10,
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
  lessonsText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'outfit-bold',
  },
  imageSection:{
    display: 'flex',
    alignItems: 'center',
    marginTop: 35,
    

},

imageBanner:{ 
    width: 370,
    height: 150,
    borderRadius:15,
    marginBottom:15
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
  loadMoreButton: {
    backgroundColor: '#D2E3FC',
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
    margin:30,
    borderRadius: 100,
  },
  loadMoreText: {
    color: '#174EA6',
    fontSize: 16,
    fontWeight: 'bold',
    
  },
});

export default AllCourses;
