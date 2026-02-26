/**
 * AMBASSADOR PROGRAM & REFERRAL SYSTEM
 * 
 * Manages user's ambassador/referral program status, stats, and link sharing.
 * Allows users to earn points by referring friends to StyleProfile.
 * 
 * Core Functions:
 * - showAmbassadorPage(): Display referral program dashboard
 *   Populates stats (referral count, points earned, level)
 *   Displays unique referral link for user
 *   Shows "How It Works" explanation
 * 
 * - getAmbassadorLevel(referrals): Calculate ambassador tier based on referral count
 *   Returns: 'Starter' (0-4) | 'Bronze' (5-9) | 'Silver' (10-24) | 'Gold' (25-49) | 'Diamond' (50+)
 *   Used for badge display in ambassador stats
 * 
 * - copyReferralLink(): Copy user's referral link to clipboard
 *   Reads from #referralLink input element
 *   Uses document.execCommand('copy') for clipboard access
 *   Shows success toast notification
 * 
 * Referral Link Format:
 * - Base: window.location.origin + '?ref=' + currentUser.referralCode
 * - Example: https://styleprofile.com?ref=ABC12345
 * - When friend signs up with referral code: stored in referredBy field
 * - Referrer gets +100 points when friend posts first outfit
 * 
 * Reward System:
 * - 100 points per successful referral (friend must post outfit)
 * - Referral count tracked in Firestore user document
 * - Level unlocks special badges and potential perks
 * 
 * Exported Functions: window.showAmbassadorPage, window.copyReferralLink, window.getAmbassadorLevel
 * 
 * Dependencies: firebase.js, state.js, toast.js
 * Initialized by: router.js afterPageLoad('ambassador') calls showAmbassadorPage()
 * Page Location: pages/ambassador.html contains stats grid, referral link input, how it works section
 * 
 * Called by: navigation.js showPage('ambassador'), dropdown menu
 */

function showAmbassadorPage() {
  document.getElementById('ambassadorPage').style.display = 'block';
  document.getElementById('ambassadorReferrals').textContent = currentUser.referrals || 0;
  document.getElementById('ambassadorEarnings').textContent = (currentUser.referrals || 0) * 100;
  document.getElementById('ambassadorLevel').textContent = getAmbassadorLevel(currentUser.referrals || 0);
  document.getElementById('referralLink').value = `${window.location.origin}?ref=${currentUser.referralCode}`;
}

function getAmbassadorLevel(referrals) {
  if (referrals >= 50) return 'Diamond';
  if (referrals >= 25) return 'Gold';
  if (referrals >= 10) return 'Silver';
  if (referrals >= 5) return 'Bronze';
  return 'Starter';
}

function copyReferralLink() {
  const link = document.getElementById('referralLink');
  link.select();
  document.execCommand('copy');
  showToast('Referral link copied!', 'success');
}

window.showAmbassadorPage = showAmbassadorPage;
window.copyReferralLink = copyReferralLink;
window.getAmbassadorLevel = getAmbassadorLevel;
