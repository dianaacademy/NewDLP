import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Platform,StyleSheet } from 'react-native';
import tw from 'twrnc';
import { Colors } from '../../constants/Colors';
import { SimpleLineIcons } from '@expo/vector-icons';
import { auth } from '@/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { setItem } from  '@/store/storage'; // Function to store user session details
import { router } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message'; 
import { useNavigation } from "@react-navigation/native";// For notifications
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import {
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);



  // Firebase sign-in logic
  const handleSignIn = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Storing user session info
      await storeUserInfo(user);

      // Show success toast message
      Toast.show({
        type: 'success',
        text1: 'Login Successful!',
        text2: 'You have been logged in successfully.',
        position: 'top',
      });

      // Navigate to dashboard or any other page
      router.push('/(tabs)');

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed!',
        text2: 'Please check your credentials and try again.',
        position: 'top',
      });
      console.error('Error logging in:', error);
    }
    setLoading(false);
  };

  // Store user information in async storage
  const storeUserInfo = async (user: any) => {
    try {
      await setItem('@user_id', user.uid);
      await setItem('@user_email', user.email);
      await setItem('@email_verified', JSON.stringify(user.emailVerified));
      await setItem('@access_token', user.stsTokenManager.accessToken);
      await setItem('@refresh_token', user.stsTokenManager.refreshToken);
      await setItem('@token_expiration', JSON.stringify(user.stsTokenManager.expirationTime));
    } catch (error) {
      console.error('Error storing user info:', error);
    }
  };

  const handleSignup = () => {
    router.push('/(auth)/SignupSS');
  };

  const handleForgot = () => {
    router.push('/(auth)/forgotpass');
  };


  return (
    
    
      <View style={styles.container}>
      
      <View style={styles.textContainer}>
        <Text style={styles.headingText}>Hey,</Text>
        <Text style={styles.headingText}>Welcome</Text>
        <Text style={styles.headingText}>Back</Text>
      </View>
      

        <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name={"mail-outline"} size={30} color={Colors.secondary} />
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={Colors.secondary}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputContainer}>
          <SimpleLineIcons name={"lock"} size={30} color={Colors.secondary} />
          <TextInput
            style={styles.textInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={Colors.secondary}
            secureTextEntry={secureEntry}
          />
          <TouchableOpacity
            onPress={() => {
              setSecureEntry((prev) => !prev);
            }}
          >
            <SimpleLineIcons secureTextEntry={secureEntry ? "eye" : "eye-off"} size={20} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleForgot}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButtonWrapper} onPress={handleSignIn} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator style={styles.loginButtonWrapper} />
            
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>
        



        <Text style={styles.continueText}>or</Text>
        <TouchableOpacity style={styles.googleButtonContainer} onPress={handleSignup}>
          <SimpleLineIcons name={"screen-smartphone"} size={30} color={Colors.secondary} />
          <Text style={styles.googleText}>Login with OTP</Text>
        </TouchableOpacity>
        <Text style={styles.continueText}>or continue with</Text>

        <TouchableOpacity style={styles.googleButtonContainer}
          >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <View style={styles.googleButtonContent}>
              <Image
                source={require("../../assets/images/google.png")}
                style={styles.googleImage}
              />
              <Text style={styles.googleText}>Google</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.footerContainer}>
          <Text style={styles.accountText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignup} >
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      </View>
     
    
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 25,
  },
  backButtonWrapper: {
    height: 40,
    width: 40,
    backgroundColor: Colors.gray,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    marginVertical: 20,
  },
  headingText: {
    fontSize: 32,
    color: Colors.primary,
    fontFamily: 'outfit-bold',
  },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 100,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 7,
    marginVertical: 10,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: 'outfit',
  },
  forgotPasswordText: {
    textAlign: "right",
    color: Colors.primary,
    fontFamily: 'outfit',
    marginVertical: 10,
  },
  loginButtonWrapper: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 100,
    marginTop: 20,
  },
  loginText: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: 'outfit',
    textAlign: "center",
    padding: 10,
  },
  continueText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
    fontFamily: 'outfit',
    color: Colors.primary,
  },
  googleButtonContainer: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleImage: {
    height: 20,
    width: 20,
  },
  googleText: {
    fontSize: 20,
    fontFamily: 'outfit',
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    gap: 5,
  },
  accountText: {
    color: Colors.primary,
    fontFamily: 'outfit',
  },
  signupText: {
    color: Colors.primary,
    fontFamily: 'outfit',
  },
});

export default LoginScreen;
