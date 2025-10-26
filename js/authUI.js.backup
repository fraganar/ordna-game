/**
 * Auth UI Module - Firebase Authentication UI with FirebaseUI
 * Handles account upgrade from anonymous to permanent account
 */

// Initialize FirebaseUI instance (lazy - created when needed)
let ui = null;

function getAuthUI() {
    if (!ui && typeof firebaseui !== 'undefined' && firebase.auth) {
        ui = new firebaseui.auth.AuthUI(firebase.auth());
    }
    return ui;
}

// FirebaseUI configuration
const uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: (authResult) => {
            // User signed in successfully - now has permanent account
            const user = authResult.user;
            const playerId = user.uid;
            const isNewUser = authResult.additionalUserInfo?.isNewUser;

            console.log('✅ User authenticated:', playerId, isNewUser ? '(new user)' : '(existing user)');

            // Check if user needs to set a real name (only for new users)
            if (isNewUser) {
                const currentName = localStorage.getItem('playerName');
                if (!currentName || isDummyName(currentName)) {
                    // Prompt for name
                    const name = prompt('Vad heter du?');
                    if (name && name.trim()) {
                        localStorage.setItem('playerName', name.trim());
                        // Sync to Firebase
                        if (window.FirebaseAPI) {
                            window.FirebaseAPI.upsertPlayer(playerId, name.trim());
                        }
                    }
                }
            }

            // Close modal
            hideAuthDialog();

            // Show appropriate message based on whether user is new or existing
            if (isNewUser) {
                alert('✅ Konto skapat! Nu kan du dela din utmaning.');
            } else {
                alert('✅ Inloggad! Välkommen tillbaka.');
            }

            // Reload page to refresh UI with new auth state
            window.location.reload();

            return false; // Don't redirect
        },

        signInFailure: (error) => {
            console.error('Sign-in failed:', error);

            // Handle provider conflict - email exists with different auth method
            if (error.code === 'auth/account-exists-with-different-credential') {
                const email = error.email;
                // Note: error.credential could be used for automatic account linking in the future

                // Get which providers this email uses
                return firebase.auth().fetchSignInMethodsForEmail(email).then(methods => {
                    const providerName = methods[0].includes('google') ? 'Google' :
                                       methods[0].includes('password') ? 'Email/Lösenord' :
                                       'annan metod';

                    const useOtherProvider = confirm(
                        `⚠️ Emailen "${email}" används redan med ${providerName}.\n\n` +
                        `Vill du logga in med ${providerName} istället?`
                    );

                    if (useOtherProvider) {
                        // Close current dialog
                        hideAuthDialog();

                        // Show dialog again, user can select correct provider
                        setTimeout(() => showAuthDialog(), 500);

                        return Promise.resolve();
                    } else {
                        alert('Använd en annan email-adress eller logga in med rätt metod.');
                        return Promise.resolve();
                    }
                }).catch(fetchError => {
                    console.error('Error fetching sign-in methods:', fetchError);
                    alert('❌ Kunde inte kontrollera inloggningsmetoder: ' + fetchError.message);
                });
            }

            // Show clear, user-friendly error messages
            if (error.code === 'auth/email-already-in-use') {
                alert('⚠️ Den emailen används redan. Försök logga in istället, eller använd en annan email.');
            } else if (error.code === 'auth/wrong-password') {
                alert('❌ Fel lösenord. Försök igen.');
            } else if (error.code === 'auth/user-not-found') {
                alert('❌ Inget konto hittat med den emailen. Skapa ett nytt konto.');
            } else if (error.code === 'auth/weak-password') {
                alert('❌ Lösenordet är för svagt. Använd minst 6 tecken.');
            } else if (error.code === 'auth/invalid-email') {
                alert('❌ Ogiltig email-adress.');
            } else {
                alert('❌ Inloggning misslyckades: ' + error.message);
            }
        }
    },

    signInOptions: [
        // Email + Password
        {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: false
        },

        // Google Sign-In
        {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            customParameters: {
                // Force account selection even when one account is available
                prompt: 'select_account'
            }
        }
    ],

    // Disable automatic anonymous account upgrade to avoid merge conflicts
    // Users will get a new account when they sign in (anonymous data is lost, but this is OK
    // since anonymous users haven't created shareable challenges yet)
    autoUpgradeAnonymousUsers: false,

    // Use popup instead of redirect (better for PWA/WebView)
    signInFlow: 'popup',

    // Enable account chooser to help with provider conflicts
    credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,

    // Terms of service and privacy policy URLs
    // TODO: Create actual T&S and Privacy Policy pages before production
    tosUrl: '/terms.html',
    privacyPolicyUrl: '/privacy.html'
};

/**
 * Show FirebaseUI authentication dialog
 */
function showAuthDialog() {
    const modal = document.getElementById('auth-modal');
    const container = document.getElementById('firebaseui-container');

    if (!modal || !container) {
        console.error('Auth modal or container not found in DOM');
        return;
    }

    // Show modal
    modal.classList.add('show');

    // Start FirebaseUI
    const authUI = getAuthUI();
    if (authUI) {
        // Clear any previous UI
        container.innerHTML = '';

        // Start the UI
        authUI.start('#firebaseui-container', uiConfig);
    } else {
        console.error('FirebaseUI not available');
        alert('❌ Firebase UI kunde inte laddas. Kontrollera din internetanslutning.');
    }
}

/**
 * Hide authentication dialog
 */
function hideAuthDialog() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('show');
    }

    // Reset FirebaseUI
    const authUI = getAuthUI();
    if (authUI) {
        authUI.reset();
    }
}

/**
 * Check if current user is anonymous
 * @returns {boolean} True if user is anonymous
 */
function isAnonymousUser() {
    if (!firebase || !firebase.auth) {
        return true;
    }

    const user = firebase.auth().currentUser;
    return user ? user.isAnonymous : true;
}

/**
 * Get current auth user
 * @returns {object|null} Current Firebase Auth user or null
 */
function getCurrentAuthUser() {
    if (!firebase || !firebase.auth) {
        return null;
    }

    return firebase.auth().currentUser;
}

/**
 * Logout current user
 */
async function logout() {
    if (!confirm('Är du säker på att du vill logga ut?')) {
        return;
    }

    try {
        // Sign out from Firebase
        await firebase.auth().signOut();

        // Clear all localStorage
        localStorage.clear();

        console.log('✅ User logged out successfully');
        alert('✅ Utloggad! Du kommer automatiskt bli inloggad anonymt igen.');

        // Reload page to re-initialize with anonymous auth
        window.location.reload();
    } catch (error) {
        console.error('❌ Logout error:', error);
        alert('❌ Något gick fel vid utloggning: ' + error.message);
    }
}

// Export functions globally
window.showAuthDialog = showAuthDialog;
window.hideAuthDialog = hideAuthDialog;
window.isAnonymousUser = isAnonymousUser;
window.getCurrentAuthUser = getCurrentAuthUser;
window.logout = logout;
