import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { firestore } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Course {
    id: string;
    courseName: string;
    description: string;
    thumbnailUrl: string;
    instructorName: string;
    // Add other course properties as needed
}

const CourseDetails: React.FC = () => {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = useLocalSearchParams<{ id: string }>(); // Assuming course ID is passed as 'id' in the route
    const router = useRouter();

    useEffect(() => {
        const fetchCourseDetails = async () => {
            setLoading(true);
            try {
                const courseDoc = await getDoc(doc(firestore, 'courses', id!));
                if (courseDoc.exists()) {
                    setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
                } else {
                    console.error('Course not found');
                }
            } catch (error) {
                console.error('Error fetching course details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCourseDetails();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!course) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Course not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Image
                    source={{ uri: course.thumbnailUrl || 'https://ik.imagekit.io/growthx100/default-image.jpg' }}
                    style={styles.thumbnail}
                />
                <View style={styles.content}>
                    <Text style={styles.courseTitle}>{course.courseName}</Text>
                    <Text style={styles.instructor}>Instructor: {course.instructorName}</Text>
                    <Text style={styles.description}>{course.description}</Text>
                </View>
                <TouchableOpacity
                    style={styles.enrollButton}
                    onPress={() => router.push(`/(tabs)/profile`)}
                >
                    <Text style={styles.enrollButtonText}>Enroll Now</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    scrollContainer: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
    thumbnail: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
    content: {
        paddingHorizontal: 16,
    },
    courseTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    instructor: {
        fontSize: 16,
        color: '#555',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    enrollButton: {
        backgroundColor: '#000',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    enrollButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CourseDetails;
