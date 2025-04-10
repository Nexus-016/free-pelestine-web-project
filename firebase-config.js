import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAtFiyXzaSr8D7bvgxcJ74FI-ouvE9lxIg",
  authDomain: "voice-for-palestine-by-nex.firebaseapp.com",
  projectId: "voice-for-palestine-by-nex",
  storageBucket: "voice-for-palestine-by-nex.firebasestorage.app",
  messagingSenderId: "1050986196348",
  appId: "1:1050986196348:web:44b91612eea60baea988f9",
  measurementId: "G-BC9ZS8VLFK",
  databaseURL: "https://voice-for-palestine-by-nex-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

export { db, analytics };
