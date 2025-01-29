import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { MessageCircle, Heart, ChevronRight } from 'lucide-react-native';

const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const CommunityMini = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const db = getFirestore();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsQuery = query(
          collection(db, 'post_diana'),
          orderBy('post_time', 'desc'),
          limit(2)
        );

        const querySnapshot = await getDocs(postsQuery);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          post_time: doc.data().post_time.toDate()
        }));

        setPosts(fetchedPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleViewMore = () => {
    router.push('/content/CommunityFull');
  };

  const handlePostClick = () => {
    router.push('/content/CommunityFull');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Community</Text>
        <TouchableOpacity onPress={handleViewMore} style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>View More</Text>
          <ChevronRight size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {posts.map((post) => (
        <TouchableOpacity key={post.id} onPress={handlePostClick} style={styles.postContainer}>
          <Image 
            source={{ uri: post.post_by_profile_URL }} 
            style={styles.profileImage} 
          />
          <View style={styles.postContent}>
            <Text style={styles.userName}>{post.post_by}</Text>
            <Text style={styles.timeStamp}>
              {formatTimeAgo(post.post_time)}
            </Text>
            <Text style={styles.postText}>{post.post_content}</Text>
            <View style={styles.postActions}>
              <View style={styles.actionButton}>
                <MessageCircle size={20} color="#666" />
                <Text style={styles.actionText}>{post.post_reply}</Text>
              </View>
              <View style={styles.actionButton}>
                <Heart size={20} color="#666" />
                <Text style={styles.actionText}>{post.post_like}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '',
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewMoreText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'outfit',
  },
  postContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  postContent: {
    flex: 1,
  },
  userName: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
    marginBottom: 2,
  },
  timeStamp: {
    color: '#666',
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'outfit',
  },
  postText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: 'outfit',
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'outfit',
  },
});

export default CommunityMini;