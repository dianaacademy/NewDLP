import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { MessageCircle, Heart, ChevronDown, ChevronUp } from 'lucide-react-native';

// Time formatting utility function
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

const RepliesSection = ({ postId, isExpanded, onToggle }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const db = getFirestore();
  const REPLIES_PER_LOAD = 2;

  const fetchReplies = async (lastDoc) => {
    try {
      let repliesQuery = query(
        collection(doc(db, 'post_diana', postId), 'reply'),
        orderBy('reply_time', 'desc'),
        limit(REPLIES_PER_LOAD)
      );

      if (lastDoc) {
        repliesQuery = query(
          collection(doc(db, 'post_diana', postId), 'reply'),
          orderBy('reply_time', 'desc'),
          startAfter(lastDoc),
          limit(REPLIES_PER_LOAD)
        );
      }

      const querySnapshot = await getDocs(repliesQuery);
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      const newReplies = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        reply_time: doc.data().reply_time.toDate()
      }));

      if (newReplies.length < REPLIES_PER_LOAD) {
        setHasMoreReplies(false);
      }

      return { replies: newReplies, lastDoc: lastVisible };
    } catch (error) {
      console.error('Error fetching replies:', error);
      return { replies: [], lastDoc: null };
    }
  };

  const loadInitialReplies = async () => {
    if (!isExpanded) return;
    setLoading(true);
    const { replies: initialReplies, lastDoc } = await fetchReplies();
    setReplies(initialReplies);
    setLastVisible(lastDoc);
    setLoading(false);
  };

  const loadMoreReplies = async () => {
    if (loadingMore || !lastVisible || !hasMoreReplies) return;
    
    setLoadingMore(true);
    const { replies: newReplies, lastDoc } = await fetchReplies(lastVisible);
    
    if (newReplies.length > 0) {
      setReplies(prev => [...prev, ...newReplies]);
      setLastVisible(lastDoc);
    }
    
    setLoadingMore(false);
  };

  const handlePostReply = async () => {
    if (!newReply.trim()) return;

    try {
      const replyData = {
        reply_content: newReply,
        reply_time: serverTimestamp(),
        reply_by: "Current User", // Replace with actual user name
        profile_reply: "https://example.com/profile.jpg" // Replace with actual profile URL
      };

      await addDoc(collection(doc(db, 'post_diana', postId), 'reply'), replyData);
      
      // Update post reply count
      const postRef = doc(db, 'post_diana', postId);
      await updateDoc(postRef, {
        post_reply: increment(1)
      });

      // Reset input and reload replies
      setNewReply('');
      loadInitialReplies();
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      loadInitialReplies();
    }
  }, [isExpanded]);

  if (!isExpanded) return null;

  return (
    <View style={styles.repliesSection}>
      <View style={styles.replyInputContainer}>
        <TextInput
          style={styles.replyInput}
          value={newReply}
          onChangeText={setNewReply}
          placeholder="Write a reply..."
          multiline
        />
        <TouchableOpacity
          style={styles.replyButton}
          onPress={handlePostReply}
        >
          <Text style={styles.replyButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <>
          {replies.map(reply => (
            <View key={reply.id} style={styles.replyContainer}>
              <Image 
                source={{ uri: reply.profile_reply }}
                style={styles.replyProfileImage}
              />
              <View style={styles.replyContent}>
                <Text style={styles.replyUserName}>{reply.reply_by}</Text>
                <Text style={styles.replyTimeStamp}>
                  {formatTimeAgo(reply.reply_time)}
                </Text>
                <Text style={styles.replyText}>{reply.reply_content}</Text>
              </View>
            </View>
          ))}
          
          {hasMoreReplies && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMoreReplies}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                <Text style={styles.loadMoreText}>Load more replies</Text>
              )}
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const CommunityFull = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [likedPosts, setLikedPosts] = useState(new Set());
    const router = useRouter();
    const db = getFirestore();
    const POSTS_PER_PAGE = 13;
  
    const fetchPosts = async (lastDoc) => {
      try {
        let postsQuery = query(
          collection(db, 'post_diana'),
          orderBy('post_time', 'desc'),
          limit(POSTS_PER_PAGE)
        );
  
        if (lastDoc) {
          postsQuery = query(
            collection(db, 'post_diana'),
            orderBy('post_time', 'desc'),
            startAfter(lastDoc),
            limit(POSTS_PER_PAGE)
          );
        }
  
        const querySnapshot = await getDocs(postsQuery);
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        
        const newPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          post_time: doc.data().post_time.toDate()
        }));
  
        // Check if we have fewer posts than the limit
        if (newPosts.length < POSTS_PER_PAGE) {
          setHasMorePosts(false);
        }
  
        return { posts: newPosts, lastDoc: lastVisible };
      } catch (error) {
        console.error('Error fetching posts:', error);
        return { posts: [], lastDoc: null };
      }
    };
  
    const loadInitialPosts = async () => {
      setLoading(true);
      const { posts: initialPosts, lastDoc } = await fetchPosts();
      setPosts(initialPosts);
      setLastVisible(lastDoc);
      setLoading(false);
    };
  
    const loadMorePosts = async () => {
      if (loadingMore || !lastVisible || !hasMorePosts) return;
      
      setLoadingMore(true);
      const { posts: newPosts, lastDoc } = await fetchPosts(lastVisible);
      
      if (newPosts.length > 0) {
        setPosts(prev => [...prev, ...newPosts]);
        setLastVisible(lastDoc);
      }
      
      setLoadingMore(false);
    };
  
    useEffect(() => {
      loadInitialPosts();
    }, []);
  
    const handleReplyPress = (postId) => {
      router.push(`/community/replies?postId=${postId}`);
    };
  
    const handleLikePress = async (postId) => {
      try {
        const postRef = doc(db, 'post_diana', postId);
        
        if (likedPosts.has(postId)) {
          // Unlike
          await updateDoc(postRef, {
            post_like: increment(-1)
          });
          setLikedPosts(prev => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
          setPosts(prev => prev.map(post => 
            post.id === postId 
              ? { ...post, post_like: post.post_like - 1 }
              : post
          ));
        } else {
          // Like
          await updateDoc(postRef, {
            post_like: increment(1)
          });
          setLikedPosts(prev => new Set([...prev, postId]));
          setPosts(prev => prev.map(post => 
            post.id === postId 
              ? { ...post, post_like: post.post_like + 1 }
              : post
          ));
        }
      } catch (error) {
        console.error('Error updating like:', error);
      }
  
  const [expandedPost, setExpandedPost] = useState(null);

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <Image 
        source={{ uri: item.post_by_profile_URL }} 
        style={styles.profileImage} 
      />
      <View style={styles.postContent}>
        <Text style={styles.userName}>{item.post_by}</Text>
        <Text style={styles.timeStamp}>
          {formatTimeAgo(item.post_time)}
        </Text>
        <Text style={styles.postText}>{item.post_content}</Text>
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setExpandedPost(expandedPost === item.id ? null : item.id)}
          >
            {expandedPost === item.id ? (
              <ChevronUp size={20} color="#666" />
            ) : (
              <ChevronDown size={20} color="#666" />
            )}
            <Text style={styles.actionText}>{item.post_reply} replies</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLikePress(item.id)}
          >
            <Heart 
              size={20} 
              color={likedPosts.has(item.id) ? "#ff0000" : "#666"}
              fill={likedPosts.has(item.id) ? "#ff0000" : "none"}
            />
            <Text style={styles.actionText}>{item.post_like}</Text>
          </TouchableOpacity>
        </View>
        <RepliesSection
          postId={item.id}
          isExpanded={expandedPost === item.id}
          onToggle={() => setExpandedPost(expandedPost === item.id ? null : item.id)}
        />
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
      <View style={styles.mainContainer}>
        <Text style={styles.headerText}>Community</Text>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => 
            loadingMore ? (
              <ActivityIndicator style={styles.loadingMore} size="small" color="#0000ff" />
            ) : null
          }
          style={styles.container}
        />
      </View>
    );
  };
};

const styles = StyleSheet.create({
  // ... (Previous styles remain the same)
  repliesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontFamily: 'outfit',
  },
  replyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  replyButtonText: {
    color: '#fff',
    fontFamily: 'outfit-bold',
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  replyProfileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyUserName: {
    fontFamily: 'outfit-bold',
    fontSize: 14,
  },
  replyTimeStamp: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'outfit',
  },
  replyText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'outfit',
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loadMoreText: {
    color: '#007AFF',
    fontFamily: 'outfit',
  },
});

export default CommunityFull;