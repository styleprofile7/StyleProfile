/**
 * USER PROFILE & CLOSET FEATURE
 * 
 * Manages user profile display and personal closet collection.
 * Shows user information, shared posts, and saved outfit items.
 * 
 * Core Functions:
 * - showProfilePage(): Display user profile
 *   Populates profile section with currentUser data (name, email, personality, points)
 *   Loads and displays user's shared outfits (My Posts)
 *   Sets personality badge styling
 * 
 * - loadUserOutfits(): Fetch outfits shared by current user
 *   Queries Firestore for outfits where userId == currentUser.uid
 *   Renders outfits in grid on profile page
 *   Shows empty state if no outfits yet with link to upload
 * 
 * - showClosetPage(): Display user's closet (saved items)
 *   Populates closet section with saved outfit items
 *   Loads user's closet collection
 * 
 * - loadCloset(): Fetch saved items from user's closet
 *   Queries Firestore for outfits with addedToCloset == true for this user
 *   Renders items in closet grid
 *   Shows empty state if closet empty
 * 
 * - getPersonalityName(personality): Convert personality code to display name
 *   Maps '1percenter' → 'The 1 Percenter', 'creative' → 'The Creative', etc.
 *   Used for personality badge display
 * 
 * Personality Badge Styling:
 * - CSS classes: badge-1percenter, badge-influencer, badge-creative, badge-hoods-finest,
 *                badge-rich-housewife, badge-executive, badge-9to5er, badge-alt
 * - Each has unique color scheme
 * 
 * Exported Functions: window.showProfilePage, window.showClosetPage, window.getPersonalityName
 * 
 * Dependencies: firebase.js, state.js, toast.js
 * Initialized by: router.js afterPageLoad('profile') calls showProfilePage()
 * Page Location: pages/profile.html contains profile section, user posts grid, closet grid
 * 
 * Called by: navigation.js showPage('profile'), showPage('closet')
 */

function showProfilePage() {
  document.getElementById('profilePage').style.display = 'block';
  document.getElementById('profileInitial').textContent = currentUser.initial;
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileEmail').textContent = currentUser.email;
  document.getElementById('profilePersonality').textContent = getPersonalityName(currentUser.personality);
  document.getElementById('profilePersonality').className = `personality-badge badge-${currentUser.personality}`;
  document.getElementById('profilePoints').textContent = currentUser.points || 0;
  loadUserOutfits();
}

function showClosetPage() {
  document.getElementById('closetPage').style.display = 'block';
  loadCloset();
}

async function loadUserOutfits() {
  try {
    const snapshot = await db.collection('outfits').where('userId', '==', currentUser.uid).get();
    const userOutfits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const grid = document.getElementById('userOutfits');
    if (userOutfits.length === 0) {
      grid.innerHTML = '<div class="empty-state"><h3>No outfits yet</h3><button class="btn-primary" onclick="showPage(\'upload\')" style="margin-top: 1rem;">Upload Outfit</button></div>';
      return;
    }

    grid.innerHTML = '';
    userOutfits.forEach(outfit => grid.appendChild(createOutfitCard(outfit)));
  } catch (error) {
    console.error('Load user outfits error:', error);
  }
}

async function loadCloset() {
  try {
    const snapshot = await db.collection('outfits')
      .where('userId', '==', currentUser.uid)
      .where('inCloset', '==', true)
      .get();
    const closetItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const grid = document.getElementById('closetGrid');
    if (closetItems.length === 0) {
      grid.innerHTML = '<div class="empty-state"><h3>Your closet is empty</h3><p>Add outfits when uploading by checking "Add to My Closet"</p></div>';
      return;
    }

    grid.innerHTML = '';
    closetItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'closet-item';
      div.innerHTML = `
        <img src="${item.image}" alt="Closet item">
        <div class="closet-item-info">
          <p style="font-weight: 600; margin-bottom: 0.5rem;">${item.occasion || 'Outfit'}</p>
          <p style="font-size: 0.85rem; color: var(--light-text);">${item.brands || ''}</p>
        </div>
      `;
      div.onclick = () => {
        showPage('home');
        setTimeout(() => {
          const card = document.querySelector(`[onclick*="${item.id}"]`)?.closest('.outfit-card');
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      };
      grid.appendChild(div);
    });
  } catch (error) {
    console.error('Load closet error:', error);
    document.getElementById('closetGrid').innerHTML = '<div class="empty-state"><h3>Error loading closet</h3></div>';
  }
}

window.showProfilePage = showProfilePage;
window.showClosetPage = showClosetPage;
window.loadCloset = loadCloset;
window.loadUserOutfits = loadUserOutfits;
