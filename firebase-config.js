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
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "",
    databaseURL: ""
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
