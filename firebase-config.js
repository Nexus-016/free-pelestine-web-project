import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAtFiyXzaSr8D7bvgxcJ74FI-ouvE9lxIg",
  authDomain: "voice-for-palestine-by-nex.firebaseapp.com",
  databaseURL: "https://voice-for-palestine-by-nex-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "voice-for-palestine-by-nex",
  storageBucket: "voice-for-palestine-by-nex.appspot.com",
  messagingSenderId: "1050986196348",
  appId: "1:1050986196348:web:44b91612eea60baea988f9",
  measurementId: "G-BC9ZS8VLFK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);

export { database, analytics };
