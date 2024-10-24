import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import tw from 'twrnc';
import { auth } from '@/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { setItem } from '@/store/storage'; // Function to store user session details
import { router } from 'expo-router'; // For navigation
import Toast from 'react-native-toast-message'; // For notifications

import { Link } from 'expo-router';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 justify-center px-8 bg-white`}
    >
      <Text style={tw`text-3xl font-bold mb-4`}>Sign in</Text>

      {/* Email Input */}
      <TextInput
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        style={tw`border p-4 mb-4 border-gray-300 rounded-lg`}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={tw`border p-4 mb-4 border-gray-300 rounded-lg`}
      />

      {/* Remember Me and Forgot Password */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`ml-2`}>Remember me</Text>
        </View>
        <TouchableOpacity>
          <Text style={tw`text-blue-500`}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        style={tw`bg-green-500 p-4 rounded-lg mb-4`}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={tw`text-white text-center font-bold`}>{loading ? 'Signing in...' : 'Sign in'}</Text>
      </TouchableOpacity>

      {/* Sign Up Button */}
      <TouchableOpacity style={tw`border p-4 rounded-lg border-gray-300`}>
        <Link href="/">
        <Text style={tw`text-black text-center font-bold`}>Don't have an account? Sign up</Text>
        </Link>
      </TouchableOpacity>

      {/* Social Media Login */}
      <Text style={tw`text-center mt-8 mb-4`}>or continue with</Text>
      <View style={tw`flex-row justify-center`}>
        <TouchableOpacity style={tw`mr-4`}>
          <Image
            source={{ uri: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' }}
            style={{ width: 40, height: 40 }}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png' }}
            style={{ width: 40, height: 40 }}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
