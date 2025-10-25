/**
 * Feedback Form Module
 * Allows users to submit bug reports, questions, and other feedback
 */

/**
 * Show feedback dialog
 */
function showFeedbackDialog() {
    const modal = document.getElementById('feedback-modal');
    if (!modal) {
        console.error('Feedback modal not found');
        return;
    }

    // Reset form
    document.getElementById('feedback-category').value = 'bug';
    document.getElementById('feedback-message').value = '';
    document.getElementById('feedback-error').classList.add('hidden');

    // Show modal
    modal.classList.add('show');
}

/**
 * Hide feedback dialog
 */
function hideFeedbackDialog() {
    const modal = document.getElementById('feedback-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Submit feedback to Firestore
 */
async function submitFeedback() {
    const category = document.getElementById('feedback-category').value;
    const message = document.getElementById('feedback-message').value.trim();
    const errorDiv = document.getElementById('feedback-error');
    const submitBtn = document.getElementById('feedback-submit-btn');

    // Validate
    if (!message) {
        errorDiv.textContent = '❌ Skriv ett meddelande först';
        errorDiv.classList.remove('hidden');
        return;
    }

    if (message.length < 10) {
        errorDiv.textContent = '❌ Meddelandet måste vara minst 10 tecken';
        errorDiv.classList.remove('hidden');
        return;
    }

    // Get player info
    const playerId = window.getCurrentPlayerId ? window.getCurrentPlayerId() : null;
    const playerName = localStorage.getItem('playerName') || 'Okänd';

    if (!playerId) {
        errorDiv.textContent = '❌ Du måste vara inloggad för att skicka feedback';
        errorDiv.classList.remove('hidden');
        return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Skickar...';

    try {
        // Check if Firebase is initialized
        if (!window.FirebaseAPI || !firebase.firestore) {
            throw new Error('Firebase inte tillgängligt');
        }

        // Create feedback document
        const feedbackData = {
            playerId: playerId,
            playerName: playerName,
            category: category,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'new',
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Save to Firestore
        const db = firebase.firestore();
        await db.collection('feedback').add(feedbackData);

        // Success!
        hideFeedbackDialog();
        alert('✅ Tack för din feedback! Vi läser alla meddelanden.');

        console.log('✅ Feedback submitted successfully');

    } catch (error) {
        console.error('❌ Failed to submit feedback:', error);
        errorDiv.textContent = '❌ Kunde inte skicka feedback. Försök igen senare.';
        errorDiv.classList.remove('hidden');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Skicka';
    }
}

// Export functions globally
window.showFeedbackDialog = showFeedbackDialog;
window.hideFeedbackDialog = hideFeedbackDialog;
window.submitFeedback = submitFeedback;
