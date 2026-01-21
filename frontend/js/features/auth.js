/**
 * AUTHENTICATION FEATURE MODULE
 * 
 * Handles user registration, login, password reset, and logout flows.
 * Integrates with Firebase Authentication and Firestore database.
 * 
 * Core Functions:
 * - handleSignup(e): User registration
 *   Creates Firebase Auth account, initializes user Firestore document with profile data
 *   Handles personality selection, referral codes, welcome email
 * 
 * - handleLogin(e): User login
 *   Authenticates with Firebase, retrieves user data from Firestore
 *   Updates global currentUser state, shows app UI
 * 
 * - handleForgotPassword(e): Password reset
 *   Sends Firebase password reset email to user
 *   User clicks link in email to set new password
 * 
 * - logout(): User logout
 *   Firebase sign out, clears currentUser, shows hero/login screen
 * 
 * User Data Structure (Firestore):
 * {
 *   name, email, personality (8 types),
 *   initial, profileImage, points, ratingsGiven, postsCount, avgRating,
 *   referralCode, referrals, referredBy, ambassadorLevel, createdAt
 * }
 * 
 * Personality Types: '1percenter' | 'influencer' | 'creative' | 'hoods-finest' | 
 *                    'rich-housewife' | 'executive' | '9to5er' | 'alt'
 * 
 * Exported Functions: window.handleSignup, window.handleLogin, window.handleForgotPassword, window.logout
 * 
 * Dependencies: firebase.js, state.js, toast.js, navigation.js, email notification system
 * Called by: Modal forms in index.html (signup, login, forgot password modals)
 */

async function handleSignup(e) {
  e.preventDefault();
  const btn = document.getElementById('signupSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Creating Account...';

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const personality = document.getElementById('signupPersonality').value;
  const referralCode = document.getElementById('signupReferral').value.trim();

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    const userData = {
      name,
      email,
      personality,
      initial: name.charAt(0).toUpperCase(),
      profileImage: null,
      points: 0,
      ratingsGiven: 0,
      postsCount: 0,
      avgRating: 0,
      referralCode: user.uid.substring(0, 8).toUpperCase(),
      referrals: 0,
      referredBy: referralCode || null,
      ambassadorLevel: 'Starter',
      joinedDate: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(user.uid).set(userData);

    if (referralCode) {
      try {
        const referrerQuery = await db.collection('users').where('referralCode', '==', referralCode).get();
        if (!referrerQuery.empty) {
          const referrerDoc = referrerQuery.docs[0];
          await db.collection('users').doc(referrerDoc.id).update({
            referrals: firebase.firestore.FieldValue.increment(1),
            points: firebase.firestore.FieldValue.increment(100)
          });
        }
      } catch (error) {
        console.error('Referral error:', error);
      }
    }

    await sendEmail(
      email,
      name,
      'Welcome to StyleProfile! 🎉',
      `Hi ${name}!\n\nWelcome to StyleProfile! Your fashion journey starts now.\n\nYour referral code: ${userData.referralCode}\n\nShare it with friends to earn rewards!\n\nBest regards,\nThe StyleProfile Team`
    );

    closeModal('signup');
    showToast('Account created successfully!', 'success');
  } catch (error) {
    console.error('Signup error:', error);
    let errorMessage = 'Signup failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    }
    showToast(errorMessage, 'error');
  }

  btn.disabled = false;
  btn.textContent = 'Create Account';
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Logging in...';

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    closeModal('login');
    showToast('Welcome back!', 'success');
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Invalid email or password';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    }
    showToast(errorMessage, 'error');
  }

  btn.disabled = false;
  btn.textContent = 'Login';
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const btn = document.getElementById('forgotSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  const email = document.getElementById('forgotEmail').value.trim();

  try {
    await auth.sendPasswordResetEmail(email);
    showToast('Password reset email sent! Check your inbox.', 'success');
    closeModal('forgotPassword');
    document.getElementById('forgotEmail').value = '';
  } catch (error) {
    console.error('Password reset error:', error);
    let errorMessage = 'Failed to send reset email';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    }
    showToast(errorMessage, 'error');
  }

  btn.disabled = false;
  btn.textContent = 'Send Reset Link';
}

async function logout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      await auth.signOut();
      currentUser = null;
      location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Logout failed', 'error');
    }
  }
}

window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.handleForgotPassword = handleForgotPassword;
window.logout = logout;
