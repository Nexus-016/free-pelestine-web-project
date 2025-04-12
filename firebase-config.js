/**
 * Firebase configuration - browser compatible version
 * This file replaces module imports with global Firebase objects
 * Updated to support clean URLs without .html extension
 */

// Initialize Firebase using the global Firebase object
// This works because the main Firebase scripts are loaded via CDN in the HTML
(function() {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAtFiyXzaSr8D7bvgxcJ74FI-ouvE9lxIg",
    authDomain: "voice-for-palestine-by-nex.firebaseapp.com",
    projectId: "voice-for-palestine-by-nex",
    storageBucket: "voice-for-palestine-by-nex.firebasestorage.app",
    messagingSenderId: "1050986196348",
    appId: "1:1050986196348:web:44b91612eea60baea988f9",
    measurementId: "G-BC9ZS8VLFK",
    databaseURL: "https://voice-for-palestine-by-nex-default-rtdb.asia-southeast1.firebasedatabase.app"
  };

  // Check if Firebase is loaded
  if (typeof firebase !== 'undefined') {
    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    // Make database reference available globally
    window.db = firebase.database();
    
    console.log('Firebase initialized successfully in firebase-config.js');
  } else {
    console.error('Firebase SDK not found. Make sure to include the Firebase scripts before this file.');
  }
})();
