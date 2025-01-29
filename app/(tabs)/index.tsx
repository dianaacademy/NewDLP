import React, { useState, useEffect, useCallback } from 'react';
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
    RefreshControl,
    AppState,
    AppStateStatus,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '@/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import AllCourses5 from '../component/RecentCourses';
import { useFonts } from "expo-font";
import { LinearGradient } from 'expo-linear-gradient';

interface Course {
    id: string;
    courseName: string;
    thumbnailUrl: string;
}

const { width } = Dimensions.get('window');

// Custom hook to handle app state changes
const useAppState = (callback: (state: AppStateStatus) => void) => {
    useEffect(() => {
        const subscription = AppState.addEventListener('change', callback);
        return () => subscription.remove();
    }, [callback]);
};

const MyLearning: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userName, setUserName] = useState<string>('');
    const router = useRouter();

    // Fetch user info and enrolled courses
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (user) {
                // Fetch user info
                let displayName = await AsyncStorage.getItem('@user_name');
                if (!displayName && user.displayName) {
                    displayName = user.displayName;
                }
                if (displayName) {
                    setUserName(displayName);
                } else {
                    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                    if (userDoc.exists() && userDoc.data().name) {
                        setUserName(userDoc.data().name);
                        await AsyncStorage.setItem('@user_name', userDoc.data().name);
                    } else {
                        setUserName('Student');
                    }
                }

                // Fetch enrolled courses from new structure
                const enrolledStudentDoc = await getDoc(doc(firestore, 'enrolledstudents', user.uid));

                if (enrolledStudentDoc.exists()) {
                    const enrolledData = enrolledStudentDoc.data();
                    const coursesData = enrolledData.courses || {};

                    const coursePromises = Object.keys(coursesData).map(async (courseId) => {
                        const courseDoc = await getDoc(doc(firestore, 'courses', courseId));
                        return { ...courseDoc.data(), id: courseId } as Course;
                    });

                    const courseList = await Promise.all(coursePromises);
                    setCourses(courseList);
                    await AsyncStorage.setItem('@enrolled_courses', JSON.stringify(courseList)); // Cache courses
                } else {
                    setCourses([]);
                    await AsyncStorage.setItem('@enrolled_courses', JSON.stringify([]));
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Load cached data on app start
    const loadCachedData = useCallback(async () => {
        try {
            const cachedCourses = await AsyncStorage.getItem('@enrolled_courses');
            if (cachedCourses) {
                setCourses(JSON.parse(cachedCourses));
            }

            const cachedUserName = await AsyncStorage.getItem('@user_name');
            if (cachedUserName) {
                setUserName(cachedUserName);
            }
        } catch (error) {
            console.error('Error loading cached data:', error);
        }
    }, []);

    // Fetch data on component mount
    useEffect(() => {
        loadCachedData(); // Load cached data first
        fetchData(); // Fetch fresh data
    }, [fetchData, loadCachedData]);

    // Re-fetch data when app comes to the foreground
    useAppState((state: AppStateStatus) => {
        if (state === 'active') {
            fetchData(); // Re-fetch data when app is reopened
        }
    });

    // Pull-to-refresh handler
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const handleViewCourse = (itemId: string) => {
        router.push(`/content/Learning?courseId=${itemId}` as any);
    };

    const ProfileRedirect = () => {
        router.push('/(tabs)/profile');
    };

    useFonts({
        'outfit': require('../../assets/fonts/Outfit-Regular.ttf'),
        'outfit-bold': require('../../assets/fonts/Outfit-Bold.ttf'),
    });

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
                <LinearGradient
                    colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']}
                    style={styles.gradient}
                    start={{ x: 0, y: 1 }} // Right
                    end={{ x: 1, y: 0 }} // Top-left
                />
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
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
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

                <TouchableOpacity onPress={() => handleViewCourse}>
                    <View style={styles.imageSection}>
                        <Image style={styles.imageBanner} source={require('../../assets/images/Banner.png')} />
                    </View>
                </TouchableOpacity>

                <View style={styles.section}>
                    {courses.length > 0 ? (
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
                    ) : (
                        <Text style={styles.noCourseText}>No course found</Text>
                    )}
                </View>

                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.welcomeText2}>Explore Other Courses</Text>
                        <TouchableOpacity onPress={() => handleViewCourse}>
                            <Text style={styles.welcomeText3}>View all</Text>
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
        alignItems: 'center', // Centers items vertically
        justifyContent: 'space-between', // Space between title and button
    },
    
    courseTitle: {
        fontSize: 16,
        fontFamily: 'outfit',
        color: '#333333',
        flex: 1,
        flexWrap: 'wrap', // Allows text to wrap for multi-line titles
    },
    
    resumeButton: {
        backgroundColor: '#000000',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    

    resumeButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontFamily: 'outfit-bold',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 50,
    },
    imageSection: {
        display: 'flex',
        alignItems: 'center',
    },
    imageBanner: {
        width: 370,
        height: 150,
        borderRadius: 15,
        marginBottom: 15,
    },
    noCourseText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#000',
        fontFamily: 'outfit',
        marginTop: 20,
    },
});

export default MyLearning;