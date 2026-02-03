/**
 * FIREBASE INITIALIZATION & CONFIGURATION
 * 
 * Bootstraps Firebase SDK for Authentication, Firestore Database, and Cloud Storage.
 * Also initializes EmailJS for server-side email notifications.
 * 
 * Exports:
 * - db: Firestore database instance
 * - auth: Firebase Authentication instance
 * - storage: Firebase Cloud Storage instance
 * - firebaseInitialized: Boolean flag indicating successful initialization
 * - sendEmail(templateParams): Function to send emails via EmailJS
 * 
 * Services:
 * - Firebase Auth: Email/password authentication, user account management
 * - Firestore: Real-time database for users, outfits, likes, ratings
 * - Cloud Storage: Image file storage for profile pictures and outfit photos
 * - EmailJS: Send welcome emails, notifications (without backend server)
 * 
 * Configuration: Hardcoded Firebase project credentials (styleprofile-feae3)
 * 
 * Dependencies: Firebase SDK (loaded via CDN in index.html), EmailJS SDK
 */

// Firebase + EmailJS bootstrap
let db, auth, storage;
let firebaseInitialized = false;

(function initFirebase() {
  // Wait for Firebase to load
  if (typeof firebase === 'undefined') {
    console.error('Firebase failed to load! Check internet connection.');
    alert('Firebase libraries failed to load. Please refresh the page.');
    return;
  }

  const firebaseConfig = {
    apiKey: "AIzaSyD42eEKFteAf2A9aFUljdv56NLNL_7iWcg",
    authDomain: "styleprofile-feae3.firebaseapp.com",
    projectId: "styleprofile-feae3",
    storageBucket: "styleprofile-feae3.firebasestorage.app",
    messagingSenderId: "369107355186",
    appId: "1:369107355186:web:5cfc7cc2e34158c9be5e2b",
    measurementId: "G-8KKR37ES4F"
  };

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    } else {
      firebase.app();
    }
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    firebaseInitialized = true;
    window.db = db;
    window.auth = auth;
    window.storage = storage;
    window.firebaseInitialized = firebaseInitialized;
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    alert('Firebase initialization failed: ' + error.message + '\n\nPlease check:\n1. Internet connection\n2. Firebase configuration\n3. Browser console for details');
    firebaseInitialized = false;
    window.firebaseInitialized = firebaseInitialized;
  }
})();

// EmailJS Configuration
const EMAILJS_CONFIG = {
  publicKey: '5L7vy_UOO9YZNWgAZ',
  serviceId: 'service_cc2f78o',
  templateId: 'template_uk8k6zw'
};

(function initEmailJs() {
  try {
    if (typeof emailjs !== 'undefined') {
      emailjs.init(EMAILJS_CONFIG.publicKey);
      console.log('EmailJS initialized');
    } else {
      console.warn('EmailJS not loaded');
    }
  } catch (error) {
    console.error('EmailJS error:', error);
  }
})();

// Email helper
async function sendEmail(toEmail, toName, subject, message) {
  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      {
        to_email: toEmail,
        to_name: toName,
        from_name: "StyleProfile Team",
        subject,
        message,
        reply_to: "styleprofileinc@gmail.com"
      }
    );
    console.log('Email sent:', response);
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.text || error.message };
  }
}
window.sendEmail = sendEmail;
