
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyBMgD92jWYxvkeSYkElx7DkCqh3a3OlK30",
  authDomain: "ddlp-456ce.firebaseapp.com",
  projectId: "ddlp-456ce",
  storageBucket: "ddlp-456ce.appspot.com",
  messagingSenderId: "133537517881",
  appId: "1:133537517881:web:7f41d03e7deed4c0ed98e8",
  measurementId: "G-VXJGENCYD1",
};

let firebaseApp: FirebaseApp;

try {
  firebaseApp = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw new Error("Firebase initialization failed");
}

const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const database = getDatabase(firebaseApp);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { firebaseApp, auth, database, firestore, storage };