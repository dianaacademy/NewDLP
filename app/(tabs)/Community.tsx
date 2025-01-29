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
    Linking
} from 'react-native';
import { auth, firestore } from '@/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { getItem } from '@/store/storage';
import AllCourses5 from '../component/RecentCourses';
import { useFonts } from "expo-font";
import CommunityMini from '../content/CommuintyMini';


interface Course {
    id: string;
    courseName: string;
    thumbnailUrl: string;
}

interface SocialMediaLink {
  id: string;
  url: string;
  name: string;
  icon: any; // Using 'any' for require() image source type
}

const { width } = Dimensions.get('window');

const Community: React.FC = () => {
    
    const router = useRouter();











    


    const handleView = (courseId: string) => {
        router.push('/(tabs)/Mylearning');
    };

    const handleViewCourse = () => {
      router.push(`/content/CommunityFull`);
     
  };


    

    const ProfileRedirect = () => {
        router.push('/(tabs)/profile');
    };

    

    useFonts({
        'outfit': require('../../assets/fonts/Outfit-Regular.ttf'),
        'outfit-bold': require('../../assets/fonts/Outfit-Bold.ttf'),
    });


    
    const openLink = async (url: string): Promise<void> => {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error('Error opening link:', error);
      }
    };

    const socialMediaLinks: SocialMediaLink[] = [
      {
        id: 'facebook',
        name: 'Facebook',
        url: 'https://www.facebook.com/dianaadvancedtech/',
        icon: require('../../assets/images/fb.png')
      },
      {
        id: 'instagram',
        name: 'Instagram',
        url: 'https://www.instagram.com/dianaadvancedtech/',
        icon: require('../../assets/images/insta.png')
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/diana-academy/',
        icon: require('../../assets/images/linked.png')
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        url: 'https://wa.me/+447441441208',
        icon: require('../../assets/images/whatsapp.png')
      },
      
    ];

  

 

  

    return (
        <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
        


      <TouchableOpacity  onPress={() => handleView}>
            <View style={styles.imageSection}>
    <Image style={styles.imageBanner} source={require('../../assets/images/Banner.png')} 
      
    />
  </View>
  </TouchableOpacity>
  


  <View>
            <View style={{ }}>
              <Text style={styles.welcomeText2}>Follow us on</Text>
              
      
              <View style={styles.container}>
      
      <View style={styles.iconsGrid}>
        {socialMediaLinks.map((social) => (
          <TouchableOpacity
            key={social.id}
            onPress={() => openLink(social.url)}
            style={styles.iconContainer}
          >
            <View style={styles.iconBackground}>
              <Image 
                source={social.icon}
                style={styles.icon}
              />
            </View>
            <Text style={styles.iconLabel}>{social.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    
    
    <CommunityMini />
    <View style={styles.blankspace}>
              
            </View>
    <Text style={styles.welcomeText2}>Courses from Diana</Text>
                



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

  titleText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '20%', // For 5 icons in a row
  },

  blankspace:{
    width: '100%',
    height: 50,
    color: '#fff',
    paddingLeft: 20,
  },
  iconBackground: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0', // Light gray background
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 2 
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, 
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  iconLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },


  iconWrapper: {
    marginRight: 16,
  },

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
        backgroundColor: '#fff',
        padding: 8,
        fontFamily: 'outfit-bold',
        borderRadius: 8,
    },
    resumeButtonText: {
        color: '#000',
        fontSize: 14,
        padding: 20,
        fontFamily: 'outfit-bold',
        
    },

    imageSection:{
        display: 'flex',
        alignItems: 'center',
        paddingTop: 60,
        

    },

    imageBanner:{ 
        width: 370,
        height: 150,
        borderRadius:15,
        marginBottom:15
    }
});

export default Community;