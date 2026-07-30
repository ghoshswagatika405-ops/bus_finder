import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAo3v7gV12c5qbunNydvRXgQicQomDzu3E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "location-founder-fa092.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "location-founder-fa092",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "location-founder-fa092.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "852510187783",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:852510187783:web:cd9fea06518c10d48165a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
