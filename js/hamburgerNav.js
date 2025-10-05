/**
 * Hamburger Navigation Menu
 * Handles all hamburger menu interactions (desktop & mobile)
 */

class HamburgerNav {
    constructor() {
        this.hamburgerBtn = document.getElementById('hamburger-btn');
        this.menuOverlay = document.getElementById('menu-overlay');
        this.closeMenuBtn = document.getElementById('close-menu-btn');
        this.menuHomeBtn = document.getElementById('menu-home-btn');
        this.menuChangeNameBtn = document.getElementById('menu-change-name-btn');
        this.menuHelpBtn = document.getElementById('menu-help-btn');
        this.confirmDialog = document.getElementById('confirm-dialog');
        this.confirmYesBtn = document.getElementById('confirm-yes-btn');
        this.confirmCancelBtn = document.getElementById('confirm-cancel-btn');
        this.helpModal = document.getElementById('help-modal');
        this.closeHelpBtn = document.getElementById('close-help-btn');
        this.closeHelpBottomBtn = document.getElementById('close-help-bottom-btn');

        this.isMenuOpen = false;
        this.isGameActive = false;

        this.init();
    }

    init() {
        // Open menu
        this.hamburgerBtn.addEventListener('click', () => this.openMenu());

        // Close menu
        this.closeMenuBtn.addEventListener('click', () => this.closeMenu());

        // Close menu when clicking outside menu content
        this.menuOverlay.addEventListener('click', (e) => {
            if (e.target === this.menuOverlay) {
                this.closeMenu();
            }
        });

        // Menu actions
        this.menuHomeBtn.addEventListener('click', () => this.handleBackToStart());
        this.menuChangeNameBtn.addEventListener('click', () => this.handleChangeName());
        this.menuHelpBtn.addEventListener('click', () => this.openHelpModal());

        // Confirmation dialog
        this.confirmYesBtn.addEventListener('click', () => this.confirmBackToStart());
        this.confirmCancelBtn.addEventListener('click', () => this.closeConfirmDialog());

        // Help modal
        this.closeHelpBtn.addEventListener('click', () => this.closeHelpModal());
        this.closeHelpBottomBtn.addEventListener('click', () => this.closeHelpModal());
        this.helpModal.addEventListener('click', (e) => {
            if (e.target === this.helpModal) {
                this.closeHelpModal();
            }
        });

        // ESC key to close menu/dialogs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.helpModal.classList.contains('hidden') === false) {
                    this.closeHelpModal();
                } else if (this.confirmDialog.classList.contains('hidden') === false) {
                    this.closeConfirmDialog();
                } else if (this.isMenuOpen) {
                    this.closeMenu();
                }
            }
        });
    }

    openMenu() {
        this.menuOverlay.classList.remove('hidden');
        this.isMenuOpen = true;
        document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open

        // Update player info when menu opens
        this.updatePlayerInfo();
    }

    updatePlayerInfo() {
        const playerId = localStorage.getItem('playerId');
        const playerName = localStorage.getItem('playerName');

        const menuName = document.getElementById('menu-player-name');
        const menuId = document.getElementById('menu-player-id');

        if (menuName) menuName.textContent = playerName || 'Inte satt';
        if (menuId) menuId.textContent = playerId || 'Inget ID';
    }

    closeMenu() {
        this.menuOverlay.classList.add('closing');
        setTimeout(() => {
            this.menuOverlay.classList.add('hidden');
            this.menuOverlay.classList.remove('closing');
            this.isMenuOpen = false;
            document.body.style.overflow = ''; // Restore scrolling
        }, 300); // Match animation duration
    }

    handleBackToStart() {
        // Check if game is active
        const gameScreen = document.getElementById('game-screen');
        this.isGameActive = !gameScreen.classList.contains('hidden');

        if (this.isGameActive) {
            // Show confirmation dialog
            this.closeMenu();
            setTimeout(() => {
                this.confirmDialog.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }, 350);
        } else {
            // Just go back to start
            this.goToStart();
            this.closeMenu();
        }
    }

    confirmBackToStart() {
        this.closeConfirmDialog();
        this.goToStart();
    }

    closeConfirmDialog() {
        this.confirmDialog.classList.add('hidden');
        document.body.style.overflow = '';
    }

    goToStart() {
        // Use the existing restartGame() function which handles everything correctly:
        // - Stops polling
        // - Resets game state
        // - Invalidates cache
        // - Reloads challenges (important for refreshing "Mina utmaningar"!)
        if (typeof window.restartGame === 'function') {
            window.restartGame();
        } else {
            // Fallback: Simple navigation if restartGame doesn't exist
            console.warn('restartGame() not found, using fallback navigation');
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('end-screen').classList.add('hidden');
            document.getElementById('player-setup').classList.add('hidden');
            document.getElementById('player-name-setup').classList.add('hidden');
            document.getElementById('challenge-form').classList.add('hidden');
            document.getElementById('challenge-accept').classList.add('hidden');
            document.getElementById('challenge-blocked').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
            document.getElementById('start-main').classList.remove('hidden');
        }
    }

    handleChangeName() {
        this.closeMenu();

        // Show player name setup dialog
        setTimeout(() => {
            const playerNameSetup = document.getElementById('player-name-setup');
            const playerNameInput = document.getElementById('player-name-input');

            // Hide all screens
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('end-screen').classList.add('hidden');

            // Show name change dialog
            playerNameSetup.classList.remove('hidden');

            // Pre-fill current name
            const currentName = window.PlayerManager ? window.PlayerManager.getPlayerName() : '';
            if (currentName && currentName !== 'Ej angivet') {
                playerNameInput.value = currentName;
            }

            // Focus input
            playerNameInput.focus();
        }, 350);
    }

    openHelpModal() {
        this.closeMenu();
        setTimeout(() => {
            this.helpModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }, 350);
    }

    closeHelpModal() {
        this.helpModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Public method to update game state from outside
    setGameActive(isActive) {
        this.isGameActive = isActive;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.HamburgerNav = new HamburgerNav();
    });
} else {
    window.HamburgerNav = new HamburgerNav();
}
