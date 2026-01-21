/**
 * FEED & OUTFIT DISCOVERY FEATURE
 * 
 * Manages community outfit feed display, filtering, searching, and social interactions
 * (rating, liking, deleting outfits). Central hub for outfit browsing and discovery.
 * 
 * Core Functions:
 * - loadOutfits(): Fetch all outfits from Firestore (50 most recent)
 *   Populates window.allOutfits array, calls renderFeed()
 * 
 * - renderFeed(): Display outfits in grid based on currentFilter
 *   Applies active filter (all/top-rated/fresh), renders outfit cards
 *   Called after loadOutfits() or when filter changes
 * 
 * - createOutfitCard(outfit): Generate HTML card for single outfit
 *   Shows image, user info, rating/like counts, interaction buttons
 *   Returns card element ready for insertion in feedGrid
 * 
 * - rateOutfit(outfitId, rating): Submit 1-5 star rating
 *   Updates outfit average rating in Firestore
 *   Stores rating in ratingDistribution array
 * 
 * - likeOutfit(outfitId): Toggle like status
 *   Adds/removes currentUser from outfit's likedBy array
 *   Increments/decrements likes count
 * 
 * - deleteOutfit(outfitId): Remove outfit from feed
 *   Deletes from Firestore collection
 *   Updates feed display
 * 
 * - filterFeed(filterType): Apply feed filter
 *   Sets window.currentFilter to 'all' | 'top-rated' | 'fresh'
 *   Updates filter button styling, re-renders feed
 * 
 * - searchFeed(): Filter outfits by user search query
 *   Searches in tags, brands, user names
 *   Updates feed display in real-time
 * 
 * Outfit Filters:
 * - 'all': Original timestamp order (newest first)
 * - 'top-rated': Sorted by avgRating (highest first)
 * - 'fresh': Most recently posted (newest first)
 * 
 * Exported Functions: window.loadOutfits, window.renderFeed, window.rateOutfit, window.likeOutfit,
 *                      window.deleteOutfit, window.filterFeed, window.searchFeed
 * 
 * Dependencies: firebase.js, state.js, toast.js
 * Initialized by: router.js afterPageLoad('home') calls loadOutfits()
 * Page Location: pages/home.html contains #feedGrid and search/filter UI
 */

function loadOutfits() {
  return db.collection('outfits').orderBy('timestamp', 'desc').limit(50).get()
    .then(snapshot => {
      allOutfits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderFeed();
    })
    .catch(error => {
      console.error('Load outfits error:', error);
      const grid = document.getElementById('feedGrid');
      if (grid) grid.innerHTML = '<div class="empty-state"><h3>No outfits yet</h3><p>Be the first to post!</p></div>';
    });
}

function renderFeed() {
  const feedGrid = document.getElementById('feedGrid');
  if (!feedGrid) return;
  let filtered = [...allOutfits];

  if (currentFilter === 'top-rated') {
    filtered.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
  } else if (currentFilter === 'fresh') {
    filtered.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
  }

  if (filtered.length === 0) {
    feedGrid.innerHTML = '<div class="empty-state"><h3>No outfits yet!</h3><p>Be the first to share</p></div>';
    return;
  }

  feedGrid.innerHTML = '';
  filtered.forEach(outfit => feedGrid.appendChild(createOutfitCard(outfit)));
}

function createOutfitCard(outfit) {
  const card = document.createElement('div');
  card.className = 'outfit-card';

  const isOwnOutfit = currentUser && outfit.userId === currentUser.uid;
  const userRating = outfit.ratings?.find(r => r.userId === currentUser?.uid);
  const isLiked = outfit.likes?.includes(currentUser?.uid);

  card.innerHTML = `
<img src="${outfit.image}" alt="Outfit" class="outfit-image">
<div class="outfit-content">
  <div class="user-info">
    <div class="user-avatar">
      ${outfit.userProfileImage ? `<img src="${outfit.userProfileImage}">` : outfit.userInitial}
    </div>
    <span style="font-weight: 600;">${outfit.userName}</span>
    <span class="personality-badge badge-${outfit.personality}">
      ${getPersonalityName(outfit.personality)}
    </span>
  </div>

  ${outfit.tags && outfit.tags.length > 0 ? `
  <div class="outfit-tags">
    ${outfit.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
  </div>
  ` : ''}

  <div class="rating-section">
    <div class="stars">
      ${[1,2,3,4,5].map(i => `
        <span class="star ${i <= (userRating?.rating || 0) ? 'filled' : ''}" 
          onclick="rateOutfit('${outfit.id}', ${i})"
          ${userRating || !currentUser ? 'style="cursor: not-allowed;"' : ''}>★</span>
      `).join('')}
    </div>
    <span class="rating-info" style="font-size: 0.9rem; color: var(--light-text);">${(outfit.avgRating || 0).toFixed(1)}★ (${outfit.totalRatings || 0})</span>
  </div>

  <div style="margin: 1rem 0;">
    ${outfit.brands ? `<p><strong>Brands:</strong> ${outfit.brands}</p>` : ''}
    ${outfit.occasion ? `<p><strong>Occasion:</strong> ${outfit.occasion}</p>` : ''}
    ${outfit.caption ? `<p style="color: var(--light-text);">${outfit.caption}</p>` : ''}
  </div>

  <div style="display: flex; gap: 0.5rem; margin: 1rem 0;">
    <button class="action-btn" onclick="likeOutfit('${outfit.id}')" style="background: ${isLiked ? 'var(--muted-gold)' : 'var(--off-white)'}; color: ${isLiked ? 'white' : 'var(--dark-text)'};">
      ❤️ ${(outfit.likes || []).length}
    </button>
  </div>

  <div class="action-buttons">
    <button class="action-btn" onclick="shareOutfit('${outfit.id}')">🔗 Share</button>
    ${isOwnOutfit ? `<button class="action-btn" style="background: #f44336; color: white;" onclick="deleteOutfit('${outfit.id}')">🗑️ Delete</button>` : ''}
  </div>
</div>
`;

  return card;
}

async function rateOutfit(outfitId, rating) {
  if (!currentUser) {
    showToast('Please login to rate', 'error');
    return;
  }

  try {
    const outfitRef = db.collection('outfits').doc(outfitId);
    const outfit = await outfitRef.get();
    const data = outfit.data();

    if (data.ratings?.find(r => r.userId === currentUser.uid)) {
      showToast('Already rated!', 'error');
      return;
    }

    const newRatings = [...(data.ratings || []), { userId: currentUser.uid, rating }];
    const avgRating = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;

    await outfitRef.update({
      ratings: newRatings,
      totalRatings: newRatings.length,
      avgRating
    });

    await db.collection('users').doc(currentUser.uid).update({
      ratingsGiven: firebase.firestore.FieldValue.increment(1),
      points: firebase.firestore.FieldValue.increment(10)
    });

    currentUser.points += 10;
    document.getElementById('userPoints').textContent = currentUser.points;

    showToast(`Rated ${rating} stars! +10 points`, 'success');
    loadOutfits();
  } catch (error) {
    console.error('Rating error:', error);
    showToast('Rating failed', 'error');
  }
}

async function likeOutfit(outfitId) {
  if (!currentUser) {
    showToast('Please login', 'error');
    return;
  }

  try {
    const outfitRef = db.collection('outfits').doc(outfitId);
    const outfit = await outfitRef.get();
    const data = outfit.data();
    const likes = data.likes || [];

    const index = likes.indexOf(currentUser.uid);
    if (index > -1) {
      likes.splice(index, 1);
      await outfitRef.update({ likes });
      showToast('Like removed', 'info');
    } else {
      likes.push(currentUser.uid);
      await outfitRef.update({ likes });
      await db.collection('users').doc(currentUser.uid).update({
        points: firebase.firestore.FieldValue.increment(5)
      });
      currentUser.points += 5;
      document.getElementById('userPoints').textContent = currentUser.points;
      showToast('Liked! +5 points', 'success');
    }

    loadOutfits();
  } catch (error) {
    console.error('Like error:', error);
    showToast('Action failed', 'error');
  }
}

function shareOutfit(outfitId) {
  const url = `${window.location.origin}?outfit=${outfitId}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Link copied!', 'success');
    }).catch(() => {
      showToast('Failed to copy link', 'error');
    });
  } else {
    showToast('Link: ' + url, 'info');
  }
}

async function deleteOutfit(outfitId) {
  if (!confirm('Delete this outfit?')) return;

  try {
    await db.collection('outfits').doc(outfitId).delete();
    await db.collection('users').doc(currentUser.uid).update({
      postsCount: firebase.firestore.FieldValue.increment(-1)
    });

    showToast('Outfit deleted', 'success');
    loadOutfits();
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Delete failed', 'error');
  }
}

function filterFeed(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderFeed();
}

function searchFeed() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  if (!query) {
    renderFeed();
    return;
  }

  const grid = document.getElementById('feedGrid');
  const filtered = allOutfits.filter(o => 
    o.userName.toLowerCase().includes(query) ||
    o.tags?.some(tag => tag.toLowerCase().includes(query)) ||
    getPersonalityName(o.personality).toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state"><h3>No results</h3></div>';
    return;
  }

  grid.innerHTML = '';
  filtered.forEach(o => grid.appendChild(createOutfitCard(o)));
}

function getPersonalityName(type) {
  const names = {
    '1percenter': '1 Percenter',
    'influencer': 'Influencer',
    'creative': 'Creative',
    'hoods-finest': "Hood's Finest",
    'rich-housewife': 'Rich Housewife',
    'executive': 'Executive',
    '9to5er': '9to5er',
    'alt': 'Alt'
  };
  return names[type] || type;
}

window.loadOutfits = loadOutfits;
window.filterFeed = filterFeed;
window.searchFeed = searchFeed;
window.rateOutfit = rateOutfit;
window.likeOutfit = likeOutfit;
window.shareOutfit = shareOutfit;
window.deleteOutfit = deleteOutfit;
window.getPersonalityName = getPersonalityName;
