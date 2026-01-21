/**
 * DYNAMIC PAGE ROUTER & LOADER
 * 
 * Manages client-side routing by dynamically fetching and injecting HTML pages
 * into a single container. Implements page caching for optimal performance.
 * 
 * Architecture: Replaces traditional page div toggling with on-demand page loading.
 * When user navigates, router fetches HTML from pages/ directory, caches it,
 * injects into DOM, and automatically attaches event handlers.
 * 
 * Key Features:
 * - Dynamic HTML loading via fetch()
 * - In-memory page caching (avoid repeated network requests)
 * - Automatic handler attachment after page injection
 * - Error handling with fallback UI
 * 
 * PAGES Mapping: Maps page names to their HTML file paths
 * pageCache: Stores fetched HTML to avoid refetching
 * 
 * Functions:
 * - loadPage(pageName): Fetch and inject page HTML, manage cache
 * - afterPageLoad(pageName): Attach handlers specific to loaded page
 * 
 * Exported Functions (attached to window):
 * - window.loadPage()
 * 
 * Dependencies: state.js (currentUser, currentFilter), upload.js, feed.js, profile.js, ambassador.js
 * Used by: navigation.js (showPage function calls loadPage)
 */

// Page router - dynamically loads HTML pages with caching
// CHANGED: Complete implementation with automatic handler attachment after page load
const PAGES = {
  home: './pages/home.html',
  upload: './pages/upload.html',
  profile: './pages/profile.html',
  ambassador: './pages/ambassador.html',
  about: './pages/about.html',
  privacy: './pages/privacy.html'
};

const pageCache = {};

async function loadPage(pageName) {
  const container = document.getElementById('pageContainer');
  if (!container) return;

  // Check cache first
  if (pageCache[pageName]) {
    container.innerHTML = pageCache[pageName];
    afterPageLoad(pageName);
    return;
  }

  const url = PAGES[pageName];
  if (!url) {
    console.warn(`Page not found: ${pageName}`);
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${pageName}`);
    const html = await response.text();
    
    // Cache for faster subsequent loads
    pageCache[pageName] = html;
    container.innerHTML = html;
    afterPageLoad(pageName);
  } catch (error) {
    console.error(`Error loading page ${pageName}:`, error);
    container.innerHTML = '<div class="empty-state"><h3>Page not found</h3></div>';
  }
}

function afterPageLoad(pageName) {
  // CHANGED: New function to automatically attach handlers after dynamic page injection
  // Ensures form listeners, event handlers, and page-specific functions work correctly
  // Re-attach handlers after loading new page
  if (pageName === 'home') {
    loadOutfits();
  } else if (pageName === 'upload') {
    setupDragDrop();
    attachUploadFormHandler();
  } else if (pageName === 'profile') {
    showProfilePage();
  } else if (pageName === 'ambassador') {
    showAmbassadorPage();
  }
}

window.loadPage = loadPage;

