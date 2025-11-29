/**
 * ResultScreenRenderer - Centraliserad rendering av resultatskärmar
 *
 * VIKTIGT: Denna modul genererar ENDAST HTML.
 * Event listeners och navigation hanteras av anropande kod.
 *
 * Se docs/RESULT_SCREENS.md för komplett dokumentation.
 */

window.ResultScreenRenderer = {

    /**
     * Genererar poängvisning med cirkel-badge
     * @param {number} score - Poängen att visa
     * @param {object} options - { showLabel: boolean, size: 'xl'|'6xl'|'7xl' }
     * @returns {string} HTML-sträng
     */
    renderScoreDisplay(score, options = {}) {
        const { showLabel = true, size = '7xl' } = options;
        return `
            <div class="py-5 mb-5">
                ${showLabel ? '<p class="text-lg text-slate-600 mb-2">Din slutpoäng:</p>' : ''}
                <div class="score-circle-badge mx-auto">
                    <p class="text-${size} font-bold text-primary">${score}</p>
                </div>
            </div>
        `;
    },

    /**
     * Genererar singelspel-resultat (Skärm #1 och #2)
     * @param {object} data - { score, isLoggedIn, challengeUrl }
     * @returns {string} HTML-sträng
     */
    renderSinglePlayerResult(data) {
        const { score, isLoggedIn, challengeUrl = '' } = data;

        const scoreHTML = this.renderScoreDisplay(score);

        if (isLoggedIn) {
            // Skärm #1: Challenge Waiting
            return this._renderChallengeWaiting(scoreHTML, challengeUrl);
        } else {
            // Skärm #2: Post-Game Share
            return this._renderPostGameShare(scoreHTML);
        }
    },

    /**
     * Skärm #1: Challenge Waiting (inloggad)
     * @private
     */
    _renderChallengeWaiting(scoreHTML, challengeUrl) {
        return `
            <div class="text-center p-6 sm:p-8 lg:p-12">
                <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Bra kämpat!</h2>

                ${scoreHTML}

                <div class="border-t border-slate-200 pt-6 mb-4">
                    <h3 class="text-xl font-bold text-slate-800 mb-2">🏆 Utmana någon!</h3>
                    <p class="text-slate-600 mb-3">Vågar någon slå ditt resultat? Dela länken:</p>
                </div>

                <div class="bg-white border border-slate-300 rounded p-2 mb-3">
                    <input type="text" id="challenge-link-created" value="${challengeUrl}" readonly
                           class="w-full text-xs text-gray-600 bg-transparent border-none outline-none">
                </div>

                <div class="flex space-x-2 mb-4">
                    <button id="copy-link-created"
                            class="flex-1 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                            style="background: linear-gradient(135deg, var(--color-tropical-blue) 0%, var(--color-tropical-blue-dark) 100%);">
                        Kopiera länk
                    </button>
                    <button id="share-created"
                            class="flex-1 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                            style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);">
                        Dela
                    </button>
                </div>

                <button id="restart-btn"
                        class="w-full bg-white border border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-50 transition-colors">
                    Tillbaka till start
                </button>
            </div>
        `;
    },

    /**
     * Skärm #2: Post-Game Share (anonym)
     * Note: Uses same button IDs as static HTML in index.html for event handler compatibility
     * @private
     */
    _renderPostGameShare(scoreHTML) {
        return `
            <div class="text-center p-6 sm:p-8 lg:p-12">
                <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Bra kämpat!</h2>

                ${scoreHTML}

                <p class="text-slate-600 mb-6">
                    🔗 <strong>Vill du utmana en vän?</strong> Skapa ett konto för att utmana vänner och få tillgång till fler spelfunktioner!
                </p>

                <div class="space-y-4">
                    <button id="share-challenge-btn"
                            class="w-full bg-gradient-to-r from-magic to-primary text-white font-bold py-4 px-6 rounded-lg text-lg sm:text-xl hover:from-primary hover:to-magic-dark transition-colors shadow-md">
                        Skapa konto / logga in
                    </button>

                    <button id="post-game-play-again-btn"
                            class="w-full bg-white border border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-50 transition-colors">
                        Tillbaka till start
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Skärm #3: Challenge Result (jämförelse)
     * @param {object} data - { myData, opponentData, isAnonymous }
     * @returns {string} HTML-sträng
     */
    renderChallengeResult(data) {
        const { myData, opponentData, isAnonymous } = data;

        const iWon = myData.totalScore > opponentData.totalScore;
        const isDraw = myData.totalScore === opponentData.totalScore;

        let winnerText, winnerClass;
        if (isDraw) {
            winnerText = '🤝 Oavgjort!';
            winnerClass = 'text-blue-600';
        } else if (iWon) {
            winnerText = '🏆 Du vann!';
            winnerClass = 'text-green-600';
        } else {
            winnerText = '😔 Du förlorade!';
            winnerClass = 'text-red-600';
        }

        const buttonsHTML = isAnonymous
            ? this._renderAnonymousButtons()
            : this._renderAuthenticatedButton();

        return `
            <div class="p-6 sm:p-8 lg:p-12">
                <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-center">Utmaning avslutad!</h2>

                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center">
                        <h3 class="font-bold text-lg mb-2">${myData.name}</h3>
                        <p class="text-3xl font-bold ${iWon ? 'text-green-600' : 'text-slate-600'}">${myData.totalScore} p</p>
                        <div class="mt-2 text-sm text-slate-500">
                            ${myData.questionScores.map((score, i) => `F${i+1}: ${score}p`).join(' | ')}
                        </div>
                    </div>
                    <div class="text-center">
                        <h3 class="font-bold text-lg mb-2">${opponentData.name}</h3>
                        <p class="text-3xl font-bold ${!iWon && !isDraw ? 'text-green-600' : 'text-slate-600'}">${opponentData.totalScore} p</p>
                        <div class="mt-2 text-sm text-slate-500">
                            ${opponentData.questionScores.map((score, i) => `F${i+1}: ${score}p`).join(' | ')}
                        </div>
                    </div>
                </div>

                <div class="bg-slate-100 rounded-lg p-4 mb-6 text-center">
                    <p class="text-xl font-bold ${winnerClass}">${winnerText}</p>
                </div>

                ${buttonsHTML}
            </div>
        `;
    },

    _renderAnonymousButtons() {
        return `
            <p class="text-slate-600 mb-6">
                🔗 <strong>Logga in för att spara ditt resultat</strong> - annars går det förlorat!
            </p>

            <div class="space-y-3">
                <button id="opponent-result-login-btn"
                        class="w-full bg-gradient-to-r from-magic to-primary text-white font-bold py-4 px-6 rounded-lg text-lg hover:from-primary hover:to-magic-dark transition-colors shadow-md">
                    🔐 Logga in och spara resultat
                </button>
                <button id="opponent-result-back-btn"
                        class="w-full bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-300 transition-colors">
                    Tillbaka till start
                </button>
            </div>
        `;
    },

    _renderAuthenticatedButton() {
        return `
            <button id="back-to-start-result"
                    class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition-colors">
                Tillbaka till start
            </button>
        `;
    },

    /**
     * Skärm #5: Multiplayer Result (medaljer)
     * @param {Array} players - Sorterad lista av spelare [{name, score}, ...]
     * @returns {string} HTML-sträng
     */
    renderMultiplayerResult(players) {
        const medals = ['🥇', '🥈', '🥉'];
        const medalStyles = [
            'border-amber-400 bg-amber-50 text-amber-600',
            'border-slate-300 bg-slate-50 text-slate-500',
            'border-amber-700 bg-orange-50 text-amber-800'
        ];

        let scoreboardHTML = '';
        players.forEach((player, index) => {
            if (index < 3) {
                scoreboardHTML += `
                    <div class="flex items-center gap-4 p-3 sm:p-4 rounded-lg border-2 ${medalStyles[index]}">
                        <div class="text-2xl sm:text-3xl">${medals[index]}</div>
                        <h3 class="text-lg sm:text-xl font-bold">${player.name}</h3>
                        <p class="ml-auto text-lg sm:text-xl font-bold">${player.score} poäng</p>
                    </div>
                `;
            } else {
                scoreboardHTML += `
                    <div class="flex items-center gap-4 p-3 sm:p-4 bg-slate-100 rounded-lg">
                        <span class="font-bold w-6 text-center">${index + 1}.</span>
                        <span class="text-slate-700">${player.name}</span>
                        <span class="ml-auto text-slate-700">${player.score} poäng</span>
                    </div>
                `;
            }
        });

        return `
            <div class="text-center p-6 sm:p-8 lg:p-12">
                <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Spelet är slut!</h2>
                <p class="text-slate-600 mb-6 text-base sm:text-lg">Bra kämpat allihopa!</p>

                <div class="space-y-3 sm:space-y-4 mb-8">
                    ${scoreboardHTML}
                </div>

                <button id="back-to-start-final"
                        class="w-full bg-white border border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-50 transition-colors">
                    Tillbaka till start
                </button>
            </div>
        `;
    },

    /**
     * Genererar default end-screen HTML (för restartGame)
     * @returns {string} HTML-sträng
     */
    renderDefaultEndScreen() {
        return `
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Spelet är slut!</h2>
            <p id="end-screen-subtitle" class="text-slate-600 mb-6 text-base sm:text-lg">Bra kämpat allihopa!</p>

            <div id="single-player-final" class="hidden text-slate-800 py-8 mb-8">
                <p class="text-lg text-slate-600 mb-2">Din slutpoäng:</p>
                <p id="single-final-score" class="text-7xl font-bold text-primary"></p>
            </div>

            <div id="final-scoreboard" class="space-y-3 sm:space-y-4 mb-8">
            </div>

            <button id="restart-btn"
                    class="w-full bg-gradient-to-r from-magic to-primary text-white font-bold py-3 px-6 rounded-lg text-lg sm:text-xl hover:from-primary hover:to-magic-dark transition-colors shadow-md">
                Spela igen
            </button>
        `;
    }
};
