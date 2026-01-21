/**
 * TOAST NOTIFICATION UTILITY
 * 
 * Simple toast/notification system for displaying temporary messages to users.
 * Provides non-blocking feedback for user actions (success, error, info).
 * 
 * Function:
 * - showToast(message, type): Display a toast notification
 *   @param message: String text to display
 *   @param type: 'success' | 'error' | 'info' (defaults to 'success')
 * 
 * Features:
 * - Auto-dismisses after 3.5 seconds
 * - Multiple toast types with different styling
 * - Uses CSS animation for smooth display/hide
 * - Non-intrusive (doesn't block user interaction)
 * 
 * DOM Dependencies: #toast element (in index.html), #toastMessage child
 * CSS Classes: .show (active state), type classes (.success, .error, .info)
 * 
 * Exported: window.showToast
 * 
 * Used by: All modules (auth.js, upload.js, feed.js, profile.js, ambassador.js)
 * for displaying success/error messages after user actions
 */

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastMessage').textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}
window.showToast = showToast;
