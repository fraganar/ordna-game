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
        this.changeNameModal = document.getElementById('change-name-modal');
        this.changeNameInput = document.getElementById('change-name-input');
        this.saveChangeNameBtn = document.getElementById('save-change-name-btn');
        this.cancelChangeNameBtn = document.getElementById('cancel-change-name-btn');
        this.closeChangeNameBtn = document.getElementById('close-change-name-btn');
        this.packsModal = document.getElementById('packs-modal');
        this.packsBtn = document.getElementById('menu-packs-btn');
        this.closePacksBtn = document.getElementById('close-packs-btn');
        this.closePacksBottomBtn = document.getElementById('close-packs-bottom-btn');
        this.packsList = document.getElementById('packs-list');

        this.isMenuOpen = false;
        this.isGameActive = false;
        this.isSaving = false; // Prevent spam-clicking save button
        this.modalStack = []; // Track open modals for proper scroll restoration

        this.init();
    }

    init() {
        // Toggle menu (open/close)
        this.hamburgerBtn.addEventListener('click', () => this.toggleMenu());

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
        this.packsBtn.addEventListener('click', () => this.openPacksModal());

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

        // Change name modal
        this.saveChangeNameBtn.addEventListener('click', () => this.saveNewName());
        this.cancelChangeNameBtn.addEventListener('click', () => this.closeChangeNameModal());
        this.closeChangeNameBtn.addEventListener('click', () => this.closeChangeNameModal());
        this.changeNameModal.addEventListener('click', (e) => {
            if (e.target === this.changeNameModal) {
                this.closeChangeNameModal();
            }
        });
        // Enter key to save
        this.changeNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveNewName();
            }
        });

        // Packs modal
        this.closePacksBtn.addEventListener('click', () => this.closePacksModal());
        this.closePacksBottomBtn.addEventListener('click', () => this.closePacksModal());
        this.packsModal.addEventListener('click', (e) => {
            if (e.target === this.packsModal) {
                this.closePacksModal();
            }
        });

        // ESC key to close menu/dialogs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.packsModal.classList.contains('hidden') === false) {
                    this.closePacksModal();
                } else if (this.changeNameModal.classList.contains('hidden') === false) {
                    this.closeChangeNameModal();
                } else if (this.helpModal.classList.contains('hidden') === false) {
                    this.closeHelpModal();
                } else if (this.confirmDialog.classList.contains('hidden') === false) {
                    this.closeConfirmDialog();
                } else if (this.isMenuOpen) {
                    this.closeMenu();
                }
            }
        });
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.menuOverlay.classList.remove('hidden');
        this.isMenuOpen = true;
        this.openModal('menu');

        // Update player info when menu opens
        this.updatePlayerInfo();
    }

    // Modal stack management for proper scroll restoration
    openModal(modalName) {
        if (!this.modalStack.includes(modalName)) {
            this.modalStack.push(modalName);
        }
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalName) {
        const index = this.modalStack.indexOf(modalName);
        if (index > -1) {
            this.modalStack.splice(index, 1);
        }

        // Only restore scroll if no modals are open
        if (this.modalStack.length === 0) {
            document.body.style.overflow = '';
        }
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
            this.closeModal('menu'); // Use modal stack for scroll restoration
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
                this.openModal('confirm');
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
        this.closeModal('confirm');
    }

    goToStart() {
        // Stop any challenge polling
        if (window.ChallengeSystem && window.ChallengeSystem.stopPolling) {
            window.ChallengeSystem.stopPolling();
        }

        // Clear challenge parameter from URL
        const url = new URL(window.location);
        url.searchParams.delete('challenge');
        window.history.pushState({}, '', url);

        // Clear challenge ID from window
        window.challengeId = null;

        // Hide all screens explicitly (same as challenge result button)
        const gameScreen = window.UI?.get('gameScreen');
        const endScreen = window.UI?.get('endScreen');
        const playerSetup = window.UI?.get('playerSetup');
        const challengeForm = window.UI?.get('challengeForm');
        const challengeAccept = window.UI?.get('challengeAccept');
        const challengeBlocked = window.UI?.get('challengeBlocked');
        const startScreen = window.UI?.get('startScreen');
        const startMain = window.UI?.get('startMain');

        if (gameScreen) gameScreen.classList.add('hidden');
        if (endScreen) endScreen.classList.add('hidden');
        if (playerSetup) playerSetup.classList.add('hidden');
        if (challengeForm) challengeForm.classList.add('hidden');
        if (challengeAccept) challengeAccept.classList.add('hidden');
        if (challengeBlocked) challengeBlocked.classList.add('hidden');

        // Show start screen
        if (startScreen) startScreen.classList.remove('hidden');
        if (startMain) startMain.classList.remove('hidden');

        // Reset challenge state
        if (window.ChallengeSystem) {
            window.ChallengeSystem.reset();
            window.ChallengeSystem.invalidateCache();
            window.ChallengeSystem.loadMyChallenges();
        }
    }

    handleChangeName() {
        this.closeMenu();

        setTimeout(() => {
            // Pre-fill current name
            const currentName = localStorage.getItem('playerName') || '';
            if (currentName) {
                this.changeNameInput.value = currentName;
            }

            // Clear any previous error messages
            const existingError = this.changeNameModal.querySelector('.error-message');
            if (existingError) existingError.remove();

            // Open modal
            this.changeNameModal.classList.remove('hidden');
            this.openModal('change-name');

            // Focus input and select text
            this.changeNameInput.focus();
            this.changeNameInput.select();
        }, 350);
    }

    async saveNewName() {
        // Prevent spam-clicking
        if (this.isSaving) return;

        const newName = this.changeNameInput.value.trim();

        if (!newName) {
            // Empty name - just close modal
            this.closeChangeNameModal();
            return;
        }

        // Set saving state
        this.isSaving = true;
        const saveBtn = this.saveChangeNameBtn;
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Sparar...';
        saveBtn.disabled = true;

        // Clear any previous error messages
        const existingError = this.changeNameModal.querySelector('.error-message');
        if (existingError) existingError.remove();

        try {
            // Save to localStorage
            localStorage.setItem('playerName', newName);

            // Update PlayerManager
            if (window.PlayerManager) {
                window.PlayerManager.setPlayerName(newName);
            }

            // Sync to Firebase
            const playerId = localStorage.getItem('playerId');
            if (playerId && window.FirebaseAPI) {
                await FirebaseAPI.upsertPlayer(playerId, newName);
            }

            // Update player info display in menu
            this.updatePlayerInfo();

            // Close modal - user returns to exactly where they were!
            this.closeChangeNameModal();

        } catch (error) {
            console.error('Failed to update name in Firebase:', error);

            // Show error message in modal (aligned with "Fail fast" philosophy)
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message text-red-600 text-sm mt-2';
            errorDiv.textContent = 'Kunde inte synka namn till servern. Försök igen.';

            const inputContainer = this.changeNameModal.querySelector('.mb-6');
            if (inputContainer) {
                inputContainer.appendChild(errorDiv);
            }

        } finally {
            // Restore button state
            this.isSaving = false;
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    }

    closeChangeNameModal() {
        this.changeNameModal.classList.add('hidden');
        this.closeModal('change-name');
        this.changeNameInput.value = '';
    }

    openHelpModal() {
        this.closeMenu();
        setTimeout(() => {
            this.helpModal.classList.remove('hidden');
            this.openModal('help');
        }, 350);
    }

    closeHelpModal() {
        this.helpModal.classList.add('hidden');
        this.closeModal('help');
    }

    // Open packs modal
    async openPacksModal() {
        this.closeMenu();

        setTimeout(async () => {
            try {
                // Load all packs from packs.json
                const allPacks = await window.GameData.loadAvailablePacks();

                // Load played packs from Firebase
                const playerId = localStorage.getItem('playerId');
                const playedPacks = await window.FirebaseAPI.getPlayedPacks(playerId);

                // Render list
                this.renderPacksList(allPacks, playedPacks);

                // Open modal with stack management
                this.packsModal.classList.remove('hidden');
                this.openModal('packs');
            } catch (error) {
                console.error('Failed to load packs:', error);
                // Show error in modal (fail fast - no silent fallback)
                this.packsList.innerHTML = `
                    <div class="text-center text-red-600 py-8">
                        <p class="font-semibold mb-2">Kunde inte ladda frågepaket</p>
                        <p class="text-sm">Försök igen senare eller kontrollera din internetanslutning.</p>
                    </div>
                `;
                this.packsModal.classList.remove('hidden');
                this.openModal('packs');
            }
        }, 350);
    }

    // Render packs list
    renderPacksList(allPacks, playedPacks) {
        this.packsList.innerHTML = '';

        allPacks.forEach(pack => {
            const isPlayed = playedPacks[pack.id];
            const packItem = document.createElement('div');
            packItem.className = 'bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-primary/30 transition-colors';

            packItem.innerHTML = `
                <div class="flex items-start">
                    <div class="mr-3 mt-1">
                        ${isPlayed ?
                            '<svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' :
                            '<svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6h12M6 12h12M6 18h12"></path></svg>'
                        }
                    </div>
                    <div class="flex-1">
                        <h3 class="font-semibold text-slate-800 ${!isPlayed ? 'text-slate-400' : ''}">${pack.name}</h3>
                        <p class="text-sm text-slate-600 ${!isPlayed ? 'text-slate-400' : ''}">${pack.description}</p>
                        ${isPlayed ? `
                            <div class="mt-2 text-xs text-slate-500">
                                <p>Spelat ${playedPacks[pack.id].timesPlayed} gång(er)</p>
                                <p>Bästa poäng: ${playedPacks[pack.id].bestScore}</p>
                                <p>Senast: ${this.formatDate(playedPacks[pack.id].playedAt)}</p>
                            </div>
                        ` : `
                            <p class="mt-2 text-xs text-slate-400 italic">Inte spelad ännu</p>
                        `}
                    </div>
                </div>
            `;

            this.packsList.appendChild(packItem);
        });
    }

    // Format date helper (handles both Firebase Timestamp and Date)
    formatDate(timestamp) {
        const dateObj = timestamp?.toDate ? timestamp.toDate() : timestamp;
        return new Date(dateObj).toLocaleDateString('sv-SE');
    }

    // Close packs modal
    closePacksModal() {
        this.packsModal.classList.add('hidden');
        this.closeModal('packs');
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
