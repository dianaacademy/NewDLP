import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { auth, firestore } from '@/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Link, useRouter } from 'expo-router';
import { getItem } from '@/store/storage';
import RecentCourses from '../component/RecentCourses'

interface Course {
    id: string;
    courseName: string;
    thumbnailUrl: string;
    // Add other course properties as needed
}

const MyLearning: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const displayName = await getItem('@user_name');
                setUserName(displayName || 'Student');
            } catch (error) {
                console.error('Error fetching user info:', error);
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

        fetchUserInfo();
        fetchCourses();
    }, []);

    const renderCourseItem = ({ item }: { item: Course }) => (
        <View style={styles.courseCard}>
            <Image
                source={{ 
                    uri: item.thumbnailUrl || 'https://ik.imagekit.io/growthx100/default-image.jpg?updatedAt=1709902412480'
                }}
                style={styles.courseImage}
            />
            <View style={styles.courseInfo}>
                <View style={styles.badgeContainer}>
                    <Text style={styles.newBadge}>NEW</Text>
                </View>
                <Text style={styles.courseTitle}>{item.courseName}</Text>
                <TouchableOpacity
                    style={styles.resumeButton}
                    onPress={() => router.push(`/(tabs)/profile`)}
                >
                    <Text style={styles.resumeButtonText}>Resume</Text>
                </TouchableOpacity>
            </View>
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Hey! {userName}</Text>
                <Text style={styles.subTitle}>Resume your Pending Courses</Text>
            </View>
            <FlatList
                data={courses}
                renderItem={renderCourseItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.courseList}
                showsVerticalScrollIndicator={false}
            />

            <RecentCourses/>
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
        paddingTop:35,
        fontFamily: 'outfit-bold',
        
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        fontFamily: 'outfit',
    },
    subTitle: {
        fontSize: 16,
        color: '#000',
        marginBottom: 16,
    },
    courseList: {
        padding: 16,
        gap: 16,
    },
    courseCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
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
        padding: 16,
    },
    badgeContainer: {
        marginBottom: 8,
    },
    newBadge: {
        backgroundColor: '#14b8a6',
        color: '#ffffff',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 12,
    },
    resumeButton: {
        backgroundColor: '#000000',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    resumeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MyLearning;