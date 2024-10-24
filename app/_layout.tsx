import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '@/context/AuthProvider';
import { Slot } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';


export default function RootLayout() {
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <AuthLoader />
          </AuthProvider>
          <Toast />
      </GestureHandlerRootView>
  );
}

const AuthLoader: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
};