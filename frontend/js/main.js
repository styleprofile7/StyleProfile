/**
 * APP ENTRY POINT & INITIALIZATION
 * 
 * Bootstrap file that runs when page loads. Initializes Firebase, sets up authentication
 * listeners, and establishes global event handlers for the entire application.
 * 
 * Initialization Flow:
 * 1. Window 'load' event fires → check Firebase is ready
 * 2. Hide loading screen after 1 second
 * 3. Set up Firebase auth state listener
 * 4. When user logs in: fetch user data, call showApp()
 * 5. When user logs out: return to login/hero screen
 * 
 * Global Event Listeners:
 * - window.scroll: Add shadow effect to navbar when scrolled
 * - setupDragDrop(): Enable file drag-drop (called globally for upload area)
 * - attachReferralFromUrl(): Check URL for referral code (?ref=...), auto-open signup
 * 
 * Key Functions Called:
 * - auth.onAuthStateChanged(): Listen for login/logout events
 * - db.collection('users').get(): Fetch current user data from Firestore
 * - showApp(): Initialize app UI after login (hide hero, show nav, load home page)
 * - loadPage('home'): Load home feed (now called by showApp → router)
 * 
 * Error Handling:
 * - Firebase not ready → show error toast, hide loading screen
 * - User data load error → catch block, show error toast
 * 
 * Referral System:
 * - Checks URL for ?ref=CODE parameter
 * - Auto-opens signup modal with referral code pre-filled
 * - Used when users share referral links
 * 
 * Dependencies: firebase.js, state.js, toast.js, navigation.js, upload.js, feed.js, router.js
 * 
 * Called by: index.html automatic execution after all scripts loaded
 * 
 * Note: Form attachment (attachUploadFormHandler) moved to router.js afterPageLoad()
 * for proper handling of dynamically-loaded upload page
 */

// App entry point
window.addEventListener('load', () => {
  if (!firebaseInitialized || typeof firebase === 'undefined') {
    console.error('❌ Firebase not initialized properly');
    document.querySelector('.loading-screen').classList.add('hide');
    showToast('Firebase initialization failed. Please refresh the page.', 'error');
    return;
  }

  setTimeout(() => {
    document.querySelector('.loading-screen').classList.add('hide');
  }, 1000);

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          currentUser = { uid: user.uid, ...userDoc.data() };
          // CHANGED: Removed redundant loadOutfits() here - now called by router when home page loads
          showApp();
        }
      } catch (error) {
        console.error('Error loading user:', error);
        showToast('Error loading user data', 'error');
      }
    }
  });

  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  setupDragDrop();
  // attachUploadFormHandler() is now called by router when upload page loads
  attachReferralFromUrl();
});

function attachReferralFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  if (refCode) {
    setTimeout(() => {
      openModal('signup');
      document.getElementById('signupReferral').value = refCode;
    }, 500);
  }
}
