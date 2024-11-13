import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    ScrollView,
} from 'react-native';
import { auth, firestore } from '@/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { getItem } from '@/store/storage';
import AllCourses5 from '../component/RecentCourses';
import { useFonts } from "expo-font";

interface Course {
    id: string;
    courseName: string;
    thumbnailUrl: string;
}

const { width } = Dimensions.get('window');

const MyLearning: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState<string>('');
    const router = useRouter();


    const handleView = (courseId: string) => {
        router.push('/(tabs)/Mylearning');
    };

    const handleViewCourse = (itemId: string) => {
        router.push(`/content/Learning?courseId=${itemId}` as any);
        console.log(`content/Learning?courseId=${itemId}`)
    };
    

    const ProfileRedirect = () => {
        router.push('/(tabs)/profile');
    };

    

    useFonts({
        'outfit': require('../../assets/fonts/Outfit-Regular.ttf'),
        'outfit-bold': require('../../assets/fonts/Outfit-Bold.ttf'),
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // Get the current user from Firebase Auth
                const user = auth.currentUser;
                if (user) {
                    // Try to get the name from local storage first
                    let displayName = await getItem('@user_name');
                    
                    // If no name in storage, try to get it from Firebase user
                    if (!displayName && user.displayName) {
                        displayName = user.displayName;
                    }
                    
                    // If we have a name, set it
                    if (displayName) {
                        setUserName(displayName);
                    } else {
                        // If no name found, try to get it from Firestore
                        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                        if (userDoc.exists() && userDoc.data().name) {
                            setUserName(userDoc.data().name);
                        } else {
                            setUserName('Student'); // Fallback if no name found
                        }
                    }
                } else {
                    setUserName('Student');
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                setUserName('Student');
            }
        };

        const fetchCourses = async () => {
            setLoading(true);
            try {
                const user = auth.currentUser;
                if (user) {
                    const studentId = user.uid;
                    const q = query(
                        collection(firestore, 'students'),
                        where('studentId', '==', studentId)
                    );
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const enrolledCourseIds: string[] = [];
                        querySnapshot.forEach((doc) => {
                            const studentData = doc.data();
                            if (studentData.enrolledCourses) {
                                enrolledCourseIds.push(...studentData.enrolledCourses);
                            }
                        });

                        const coursePromises = enrolledCourseIds.map(async (courseId) => {
                            const courseDoc = await getDoc(doc(firestore, 'courses', courseId));
                            return { ...courseDoc.data(), id: courseId } as Course;
                        });

                        const courseList = await Promise.all(coursePromises);
                        setCourses(courseList);
                    }
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        Promise.all([fetchUserInfo(), fetchCourses()]);
    }, []);

    const renderCourseItem = ({ item }: { item: Course }) => (
        <TouchableOpacity style={styles.courseCard} onPress={() => handleViewCourse(item.id)}>
            <Image
                source={{
                    uri: item.thumbnailUrl || 'https://ik.imagekit.io/growthx100/default-image.jpg?updatedAt=1709902412480'
                }}
                style={styles.courseImage}
            />
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{item.courseName}</Text>
                <TouchableOpacity
                    style={styles.resumeButton}
                    onPress={() => handleViewCourse(item.id)}
                >
                    <Text style={styles.resumeButtonText}>Resume</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
    <Text style={styles.welcomeText}>
        Hey! {userName || 'Student'}
    </Text>
    <TouchableOpacity onPress={ProfileRedirect}>
        <Image 
            source={require('../../assets/images/user.png')}
            style={{
                width: 30,
                height: 30,
                marginLeft: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                
            }}
               />
           </TouchableOpacity>
       </View>
       <Text style={styles.subTitle}>Resume your Pending Courses</Text>
      </View>


      <TouchableOpacity  onPress={() => handleView}>
            <View style={styles.imageSection}>
    <Image style={styles.imageBanner} source={require('../../assets/images/Banner.png')} 
      
    />
  </View>
  </TouchableOpacity>
            
            <View style={styles.section}>
                <FlatList
                    data={courses}
                    renderItem={renderCourseItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={width * 0.75}
                    decelerationRate="fast"
                    contentContainerStyle={styles.courseList}
                />
            </View>
            <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.welcomeText2}>Explore Other Courses</Text>
              <TouchableOpacity onPress={() => handleView}>
                  <Text style={styles.welcomeText3}>View all  </Text>
              </TouchableOpacity>
             </View>
          <View style={styles.section}>
              <AllCourses5 />
          </View>
</View>

        </ScrollView>
    </SafeAreaView>
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
    header: {
        padding: 16,
        paddingTop: 35,
        fontFamily: 'outfit',
    },
    welcomeText: {
        fontSize: 28,
        color: '#000',
        fontFamily: 'outfit-bold',
    },
    welcomeText2: {
        fontSize: 28,
        paddingLeft: 16,
        color: '#000',
        marginBottom: 8,
        paddingBottom: 20,
        fontFamily: 'outfit-bold',
    },
    welcomeText3: {
        fontSize: 15,
        paddingRight: 10,
        color: '#000',
        marginBottom: 8,
        paddingBottom: 20,
        fontFamily: 'outfit',
    },
    subTitle: {
        fontSize: 16,
        color: '#000',
        fontFamily: 'outfit',
    },
    section: {
        marginBottom: 20,
    },
    courseList: {
        paddingLeft: 16,
        paddingBottom: 16,
    },
    courseCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        width: width * 0.75,
        overflow: 'hidden',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    courseImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    courseInfo: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    courseTitle: {
        fontSize: 16,
        fontFamily: 'outfit',
        color: '#333333',
    },
    resumeButton: {
        backgroundColor: '#000000',
        padding: 8,
        fontFamily: 'outfit-bold',
        borderRadius: 8,
    },
    resumeButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontFamily: 'outfit-bold',
        
    },

    imageSection:{
        display: 'flex',
        alignItems: 'center',
        

    },

    imageBanner:{ 
        width: 370,
        height: 150,
        borderRadius:15,
        marginBottom:15
    }
});

export default MyLearning;