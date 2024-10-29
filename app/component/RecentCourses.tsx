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
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';

interface Course {
    id: string;
    courseName: string;
    thumbnailUrl: string;
}

const RecentCourses: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchRecentCourses = async () => {
            setLoading(true);
            try {
                const coursesQuery = query(
                    collection(firestore, 'courses'),
                    orderBy('addedDate', 'desc'),
                    limit(5)
                );
                const querySnapshot = await getDocs(coursesQuery);
                const courseList: Course[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Course[];
                setCourses(courseList);
            } catch (error) {
                console.error('Error fetching recent courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentCourses();
    }, []);

    const renderCourseItem = ({ item }: { item: Course }) => (
        <TouchableOpacity
            style={styles.courseCard}
            onPress={() => router.push(`/(auth)/OTPLogin`)}
        >
            <Image
                source={{
                    uri: item.thumbnailUrl || 'https://ik.imagekit.io/growthx100/default-image.jpg',
                }}
                style={styles.courseImage}
            />
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{item.courseName}</Text>
                <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => router.push(`/(tabs)/profile`)}
                >
                    <Text style={styles.detailsButtonText}>View Details</Text>
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
            <Text style={styles.header}>Recently Added Courses</Text>
            <FlatList
                data={courses}
                renderItem={renderCourseItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.courseList}
            />
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
        fontSize: 24,
        fontWeight: 'bold',
        padding: 16,
        color: '#000',
    },
    courseList: {
        paddingHorizontal: 16,
    },
    courseCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
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
        width: 180,
    },
    courseImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    courseInfo: {
        padding: 12,
        alignItems: 'center',
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    detailsButton: {
        backgroundColor: '#000',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    detailsButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default RecentCourses;
