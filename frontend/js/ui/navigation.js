/**
 * NAVIGATION & MODAL MANAGEMENT
 * 
 * Handles all navigation interactions, modal dialogs, page transitions, and UI state.
 * Bridges between user interactions and page loading/display logic.
 * 
 * Core Functions:
 * - openModal(modalType): Show authentication or other modal dialogs
 * - closeModal(modalType): Hide modal dialogs
 * - switchModal(from, to): Transition between different modals (e.g., login → forgot password)
 * - showPage(page, addToHistory): Load and display a page, manage navigation history
 * - showApp(): Initialize main app UI after user login (show nav, hide hero)
 * - toggleDropdown(): Show/hide user profile dropdown menu
 * - goBack(): Navigate to previous page in history
 * - updateBackButton(): Show/hide back button based on history length
 * 
 * Modal Types: 'login' | 'signup' | 'forgotPassword'
 * Page Names: 'home' | 'upload' | 'profile' | 'closet' | 'ambassador' | 'about' | 'privacy'
 * 
 * State Management:
 * - currentUser: Determines which UI elements to show
 * - pageHistory: Tracks navigation for back functionality
 * - pageContainer: Dynamic container for injected page content
 * 
 * Key Architecture Change:
 * - OLD: showPage() toggled display on 8 hardcoded inline divs
 * - NEW: showPage() calls loadPage() from router for dynamic HTML injection
 * 
 * Exported Functions (window.*):
 * - openModal, closeModal, switchModal, showPage, showApp, toggleDropdown, goBack, updateBackButton
 * 
 * Dependencies: state.js, router.js, feed.js, profile.js, ambassador.js
 * Called by: index.html onclick handlers, modal forms, button clicks
 */

function openModal(modalType) {
  document.getElementById(modalType + 'Modal')?.classList.add('show');
}

function closeModal(modalType) {
  document.getElementById(modalType + 'Modal')?.classList.remove('show');
}

function switchModal(from, to) {
  closeModal(from);
  setTimeout(() => openModal(to), 300);
}

function goBack() {
  if (pageHistory.length > 1) {
    pageHistory.pop();
    const previousPage = pageHistory[pageHistory.length - 1];
    showPage(previousPage, false);
  }
}

function updateBackButton() {
  const backBtn = document.getElementById('backBtn');
  if (!backBtn) return;
  if (pageHistory.length > 1) {
    backBtn.classList.add('show');
  } else {
    backBtn.classList.remove('show');
  }
}

function showApp() {
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('navLinks').style.display = 'none';
  document.getElementById('userDropdown').style.display = 'block';
  document.getElementById('pageContainer').style.display = 'block';

  if (currentUser.profileImage) {
    document.getElementById('userInitial').innerHTML = `<img src="${currentUser.profileImage}">`;
  } else {
    document.getElementById('userInitial').textContent = currentUser.initial;
  }

  document.getElementById('userPoints').textContent = currentUser.points || 0;
  
  // Load home page with feed
  loadPage('home');
}

function showPage(page, addToHistory = true) {
  // CHANGED: Refactored to use dynamic page loading instead of toggling display on inline divs
  // Now calls loadPage() to fetch HTML from pages/ directory
  if (addToHistory) pageHistory.push(page);
  updateBackButton();

  if (page === 'home') {
    document.getElementById('heroSection').style.display = currentUser ? 'none' : 'flex';
    document.getElementById('userDropdown').style.display = currentUser ? 'block' : 'none';
    document.getElementById('navLinks').style.display = currentUser ? 'none' : 'block';
    document.getElementById('pageContainer').style.display = currentUser ? 'block' : 'none';
    if (currentUser) loadOutfits();
  } else if (currentUser) {
    // Load dynamic pages for authenticated users
    if (page === 'upload' || page === 'profile' || page === 'ambassador') {
      loadPage(page);
    } else if (page === 'closet') {
      loadPage('profile'); // closet shares profile page
      setTimeout(() => showClosetPage(), 100);
    } else if (page === 'about' || page === 'privacy') {
      loadPage(page);
    }
  } else if (page === 'about' || page === 'privacy') {
    // Non-logged-in users can still view about/privacy
    loadPage(page);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleDropdown() {
  document.getElementById('dropdownMenu').classList.toggle('show');
}

window.addEventListener('click', (e) => {
  if (!e.target.closest('.profile-dropdown')) {
    document.getElementById('dropdownMenu').classList.remove('show');
  }
});

window.openModal = openModal;
window.closeModal = closeModal;
window.switchModal = switchModal;
window.goBack = goBack;
window.showPage = showPage;
window.toggleDropdown = toggleDropdown;
