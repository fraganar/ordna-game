// Question Rating Component
// Simple star-based rating system for questions

const QuestionRating = {
    currentQuestion: null,
    currentPlayerId: null,
    isRated: false,

    /**
     * Show rating stars for a question
     * @param {Object} question - Question object with id property
     */
    async showRating(question) {
        if (!question || !question.id) {
            console.error('QuestionRating: Invalid question object');
            return;
        }

        this.currentQuestion = question;

        // Get playerId from Firebase Auth (NOT localStorage)
        this.currentPlayerId = window.getCurrentPlayerId ? window.getCurrentPlayerId() : null;

        if (!this.currentPlayerId) {
            console.warn('QuestionRating: No player ID found');
            return;
        }

        const container = document.getElementById('question-rating');
        if (!container) {
            console.error('QuestionRating: Container #question-rating not found');
            return;
        }

        // Check if user already rated this question
        try {
            const { hasRated, rating } = await window.FirebaseAPI.hasUserRatedQuestion(
                question.id,
                this.currentPlayerId
            );

            this.isRated = hasRated;

            // Render stars
            this.renderStars(container, rating);

            // Show container
            container.classList.remove('hidden');

        } catch (error) {
            console.error('QuestionRating: Error checking rating:', error);
            // Still show stars even if check fails
            this.isRated = false;
            this.renderStars(container, null);
            container.classList.remove('hidden');
        }
    },

    /**
     * Render star elements
     * @param {HTMLElement} container - Container element
     * @param {number|null} existingRating - Existing rating (1-10) or null
     */
    renderStars(container, existingRating) {
        container.innerHTML = '';

        // Add "rated" class if user already rated
        if (this.isRated) {
            container.classList.add('rated');
        } else {
            container.classList.remove('rated');
        }

        for (let i = 1; i <= 10; i++) {
            const star = document.createElement('span');
            star.className = 'rating-star';
            star.textContent = '⭐';
            star.dataset.rating = i;

            // Fill stars up to existing rating
            if (existingRating && i <= existingRating) {
                star.classList.add('filled', 'rated');
            }

            // Only add click handler if not already rated
            if (!this.isRated) {
                star.addEventListener('click', () => this.handleRatingClick(i));

                // Hover effect: highlight stars up to hovered star
                star.addEventListener('mouseenter', () => {
                    const stars = container.querySelectorAll('.rating-star');
                    stars.forEach((s, index) => {
                        if (index < i) {
                            s.classList.add('hover-highlight');
                        } else {
                            s.classList.remove('hover-highlight');
                        }
                    });
                });

                star.addEventListener('mouseleave', () => {
                    const stars = container.querySelectorAll('.rating-star');
                    stars.forEach(s => s.classList.remove('hover-highlight'));
                });
            }

            container.appendChild(star);
        }
    },

    /**
     * Handle click on a rating star
     * @param {number} rating - Rating value (1-10)
     */
    async handleRatingClick(rating) {
        if (this.isRated) {
            return; // Already rated, ignore click
        }

        if (!this.currentQuestion || !this.currentPlayerId) {
            console.error('QuestionRating: Missing question or player ID');
            return;
        }

        try {
            // Save rating to Firebase
            const result = await window.FirebaseAPI.rateQuestion(
                this.currentQuestion.id,
                this.currentPlayerId,
                rating
            );

            // Mark as rated
            this.isRated = true;

            // Update UI to show filled stars (read-only)
            const container = document.getElementById('question-rating');
            if (container) {
                this.renderStars(container, rating);
            }

            // Optional: Show brief confirmation (subtle, no toast)
            console.log(`✅ Rated question ${this.currentQuestion.id}: ${rating}/10 (avg: ${result.averageRating.toFixed(1)}, total: ${result.totalRatings})`);

        } catch (error) {
            console.error('QuestionRating: Error saving rating:', error);

            // Show error to user (only if it's the "already rated" error)
            if (error.message.includes('redan betygsatt')) {
                // User somehow clicked twice - just mark as rated and disable
                this.isRated = true;
                const container = document.getElementById('question-rating');
                if (container) {
                    this.renderStars(container, rating);
                }
            }
        }
    },

    /**
     * Hide rating container
     */
    hide() {
        const container = document.getElementById('question-rating');
        if (container) {
            container.classList.add('hidden');
            container.innerHTML = '';
        }

        // Reset state
        this.currentQuestion = null;
        this.isRated = false;
    }
};

// Export to window for global access
window.QuestionRating = QuestionRating;
