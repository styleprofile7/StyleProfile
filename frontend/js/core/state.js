/**
 * GLOBAL APPLICATION STATE
 * 
 * Central store for shared application state accessed across all feature modules.
 * Kept minimal to maintain simplicity and avoid complex state management.
 * 
 * Variables:
 * - currentUser: Object containing logged-in user data (uid, name, email, personality, points, etc.)
 * - allOutfits: Array of outfit objects from Firestore (id, userId, image, rating, likes, etc.)
 * - currentFilter: String indicating active feed filter ('all' | 'top-rated' | 'fresh')
 * - selectedImage: Blob/File containing currently selected image for upload
 * - selectedFile: File object for upload handling
 * - pageHistory: Array tracking navigation history for back button functionality
 * 
 * Dependencies: None (this is the foundation)
 * Imported by: All feature modules access window.* global variables
 */

// Global app state kept minimal so other feature files can share it.
window.currentUser = null;
window.allOutfits = [];
window.currentFilter = 'all';
window.selectedImage = null;
window.selectedFile = null;
window.pageHistory = ['home'];
