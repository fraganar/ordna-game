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
                    // Show inline name input instead of prompt
                    showNameInput(playerId);
                    return false; // Don't reload yet
                }
            }

            // Close modal and reload
            hideAuthDialog();
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
                        showAuthError('Använd en annan email-adress eller logga in med rätt metod.');
                        return Promise.resolve();
                    }
                }).catch(fetchError => {
                    console.error('Error fetching sign-in methods:', fetchError);
                    showAuthError('Kunde inte kontrollera inloggningsmetoder: ' + fetchError.message);
                });
            }

            // Show clear, user-friendly error messages inline (not alert)
            if (error.code === 'auth/email-already-in-use') {
                showAuthError('Den emailen används redan. Försök logga in istället, eller använd en annan email.');
            } else if (error.code === 'auth/wrong-password') {
                showAuthError('Fel lösenord. Försök igen.');
            } else if (error.code === 'auth/user-not-found') {
                showAuthError('Inget konto hittat med den emailen. Skapa ett nytt konto.');
            } else if (error.code === 'auth/weak-password') {
                showAuthError('Lösenordet är för svagt. Använd minst 6 tecken.');
            } else if (error.code === 'auth/invalid-email') {
                showAuthError('Ogiltig email-adress.');
            } else {
                showAuthError('Inloggning misslyckades: ' + error.message);
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
    tosUrl: '/terms.html',
    privacyPolicyUrl: '/privacy.html'
};

/**
 * Show error message inline in auth modal
 * @param {string} message - Error message to display
 */
function showAuthError(message) {
    const errorDiv = document.getElementById('auth-error');
    const errorMessage = document.getElementById('auth-error-message');

    if (errorDiv && errorMessage) {
        errorMessage.textContent = message;
        errorDiv.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    } else {
        // Fallback to console if error div doesn't exist
        console.error('Auth error:', message);
    }
}

/**
 * Show inline name input form
 * @param {string} playerId - User's Firebase UID
 */
function showNameInput(playerId) {
    const firebaseContainer = document.getElementById('firebaseui-container');
    const nameInputDiv = document.getElementById('auth-name-input');
    const nameField = document.getElementById('auth-name-field');
    const submitBtn = document.getElementById('auth-name-submit');

    if (!firebaseContainer || !nameInputDiv || !nameField || !submitBtn) {
        console.error('Name input elements not found');
        // Fallback to old prompt behavior
        const name = prompt('Vad heter du?');
        if (name && name.trim()) {
            saveName(playerId, name.trim());
        }
        hideAuthDialog();
        window.location.reload();
        return;
    }

    // Hide FirebaseUI, show name input
    firebaseContainer.classList.add('hidden');
    nameInputDiv.classList.remove('hidden');

    // Focus on input field
    nameField.focus();

    // Handle submit
    const handleSubmit = () => {
        const name = nameField.value.trim();
        if (name) {
            saveName(playerId, name);
            hideAuthDialog();
            window.location.reload();
        } else {
            nameField.classList.add('border-red-500');
            setTimeout(() => nameField.classList.remove('border-red-500'), 1000);
        }
    };

    // Submit on button click
    submitBtn.onclick = handleSubmit;

    // Submit on Enter key
    nameField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });
}

/**
 * Save player name to localStorage and Firebase
 * @param {string} playerId - User's Firebase UID
 * @param {string} name - Player name
 */
function saveName(playerId, name) {
    localStorage.setItem('playerName', name);
    if (window.FirebaseAPI) {
        window.FirebaseAPI.upsertPlayer(playerId, name);
    }
}

/**
 * Show FirebaseUI authentication dialog
 */
function showAuthDialog() {
    const modal = document.getElementById('auth-modal');
    const container = document.getElementById('firebaseui-container');
    const nameInputDiv = document.getElementById('auth-name-input');

    if (!modal || !container) {
        console.error('Auth modal or container not found in DOM');
        return;
    }

    // Hide any previous errors
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }

    // Show FirebaseUI container, hide name input
    container.classList.remove('hidden');
    if (nameInputDiv) {
        nameInputDiv.classList.add('hidden');
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
        // Critical error - Firebase UI couldn't load (keep alert for this)
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

    // Reset name input
    const nameInputDiv = document.getElementById('auth-name-input');
    const nameField = document.getElementById('auth-name-field');
    if (nameInputDiv) {
        nameInputDiv.classList.add('hidden');
    }
    if (nameField) {
        nameField.value = '';
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
 * Show logout confirmation modal
 */
function logout() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.classList.add('show');
    } else {
        // Fallback to confirm if modal doesn't exist
        if (confirm('Är du säker på att du vill logga ut?')) {
            performLogout();
        }
    }
}

/**
 * Cancel logout and hide modal
 */
function cancelLogout() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Confirm logout and perform the action
 */
async function confirmLogout() {
    // Hide modal
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.classList.remove('show');
    }

    // Perform logout
    await performLogout();
}

/**
 * Actually perform the logout operation
 */
async function performLogout() {
    try {
        // Sign out from Firebase
        await firebase.auth().signOut();

        // Clear all localStorage
        localStorage.clear();

        console.log('✅ User logged out successfully');

        // No alert needed - page reload will show logged-out state
        // Reload page to re-initialize with anonymous auth
        window.location.reload();
    } catch (error) {
        console.error('❌ Logout error:', error);
        // Critical error - keep alert for this rare case
        alert('❌ Något gick fel vid utloggning: ' + error.message);
    }
}

// Export functions globally
window.showAuthDialog = showAuthDialog;
window.hideAuthDialog = hideAuthDialog;
window.isAnonymousUser = isAnonymousUser;
window.getCurrentAuthUser = getCurrentAuthUser;
window.logout = logout;
window.cancelLogout = cancelLogout;
window.confirmLogout = confirmLogout;
