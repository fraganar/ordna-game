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
            'challengeBlocked'
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
    }
}

// Export globally
window.NavigationManager = NavigationManager;
