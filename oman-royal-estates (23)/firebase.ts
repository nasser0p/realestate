// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
// import { getAnalytics, Analytics } from "firebase/analytics"; // Analytics can be added if needed

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxTa4SZe7eXwJrpvUPdKlpKFXZ-0WejP8", // Replace with your actual API key if different
  authDomain: "real-estate-90992.firebaseapp.com",
  projectId: "real-estate-90992",
  storageBucket: "real-estate-90992.firebasestorage.app", // Reverted to match user's screenshot
  messagingSenderId: "612442743334",
  appId: "1:612442743334:web:ba8b7aa70affc488bd3ce7",
  measurementId: "G-YJCN7YNEQ8"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize and export Firebase services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
// const analytics: Analytics = getAnalytics(app); // Analytics can be initialized and exported if needed

export { app, auth, db, storage };
// export { app, auth, db, storage, analytics }; // If using analytics