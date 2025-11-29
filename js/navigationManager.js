// Central navigation manager for consistent screen transitions
class NavigationManager {

    // Reset to start screen - THE definitive implementation
    static async resetToStartScreen() {
        // 1. Stop any challenge polling
        if (window.ChallengeSystem?.stopPolling) {
            window.ChallengeSystem.stopPolling();
        }

        // 2. Clear URL parameters
        const url = new URL(window.location);
        url.searchParams.delete('challenge');
        window.history.pushState({}, '', url);

        // 3. Clear challenge state
        window.challengeId = null;

        // 4. Hide all screens explicitly
        const screensToHide = [
            'gameScreen',
            'endScreen',
            'playerSetup',
            'challengeForm',
            'challengeAccept',
            'challengeBlocked',
            'postGameShare'  // Post-game share screen (anonymous user flow)
        ];

        screensToHide.forEach(screenId => {
            const screen = window.UI?.get(screenId);
            if (screen) screen.classList.add('hidden');
        });

        // 5. Show start screen
        const startScreen = window.UI?.get('startScreen');
        const startMain = window.UI?.get('startMain');
        if (startScreen) startScreen.classList.remove('hidden');
        if (startMain) startMain.classList.remove('hidden');

        // 6. Reset challenge system state
        if (window.ChallengeSystem) {
            window.ChallengeSystem.reset();
            window.ChallengeSystem.invalidateCache();
            // IMPORTANT: await loadMyChallenges to prevent race condition
            await window.ChallengeSystem.loadMyChallenges();
        }

        // 7. Reset pack selection state
        // This prevents pack from previous game persisting into new game
        if (window.GameController) {
            window.GameController.selectedPack = null;
        }

        // 8. Re-populate pack selectors to reflect updated played status from Firebase
        // This ensures that if the user just played a challenge pack, it shows as played
        if (window.GameData && typeof window.GameData.populatePackSelectors === 'function') {
            await window.GameData.populatePackSelectors();
        }
    }
}

// Export globally
window.NavigationManager = NavigationManager;
