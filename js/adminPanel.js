// Admin Panel Module for Tres Mangos

class AdminPanel {
    constructor() {
        this.authenticated = false;
        // Password stored as hash for minimal obfuscation (not real security)
        // Real security would require server-side authentication
        this.passwordHash = btoa('mangoadmin2024'); // Base64 encoded
        this.firebaseData = [];
        this.maxAuthAttempts = 5;
        this.authAttempts = 0;
        this.init();
    }

    init() {
        // Check if already authenticated in this session
        if (sessionStorage.getItem('adminAuthenticated') === 'true') {
            this.showAdminPanel();
        }

        // Set up event listener for password input
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.authenticate();
                }
            });
        }
    }

    authenticate() {
        // Check for rate limiting
        if (this.authAttempts >= this.maxAuthAttempts) {
            document.getElementById('authError').textContent = 'För många försök. Ladda om sidan.';
            document.getElementById('authError').style.display = 'block';
            return;
        }

        const inputPassword = document.getElementById('adminPassword').value;
        this.authAttempts++;

        // Compare with encoded password
        if (btoa(inputPassword) === this.passwordHash) {
            sessionStorage.setItem('adminAuthenticated', 'true');
            // Set session timeout (30 minutes)
            sessionStorage.setItem('adminAuthTime', Date.now().toString());
            this.authAttempts = 0;
            this.showAdminPanel();
        } else {
            const remaining = this.maxAuthAttempts - this.authAttempts;
            document.getElementById('authError').textContent =
                `Fel lösenord! ${remaining} försök kvar.`;
            document.getElementById('authError').style.display = 'block';
            setTimeout(() => {
                document.getElementById('authError').style.display = 'none';
            }, 3000);
        }
    }

    async showAdminPanel() {
        // Check session timeout (30 minutes)
        const authTime = sessionStorage.getItem('adminAuthTime');
        if (authTime && (Date.now() - parseInt(authTime) > 30 * 60 * 1000)) {
            sessionStorage.removeItem('adminAuthenticated');
            sessionStorage.removeItem('adminAuthTime');
            location.reload();
            return;
        }

        // Authenticate with Firebase Auth
        await this.ensureFirebaseAuth();

        this.authenticated = true;
        document.getElementById('authOverlay').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        this.refreshData();
        this.loadFirebaseData();
    }

    async ensureFirebaseAuth() {
        // Ensure Firebase Auth is initialized
        if (!firebase.auth) {
            console.error('Firebase Auth not available');
            return;
        }

        return new Promise((resolve) => {
            const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    console.log('✅ Admin already authenticated with Firebase Auth:', user.uid);
                    resolve();
                } else {
                    // Sign in anonymously for admin panel
                    try {
                        await firebase.auth().signInAnonymously();
                        console.log('✅ Admin signed in anonymously to Firebase');
                        resolve();
                    } catch (error) {
                        console.error('❌ Firebase Auth failed for admin:', error);
                        resolve(); // Continue anyway, but Firestore operations will fail
                    }
                }
                unsubscribe();
            });
        });
    }

    refreshData() {
        this.displayLocalStorage();
        this.updateStatistics();
    }

    displayLocalStorage() {
        const table = document.getElementById('localStorageTable');
        table.innerHTML = '';

        if (localStorage.length === 0) {
            table.innerHTML = '<tr><td colspan="3" class="empty-state">LocalStorage är tom</td></tr>';
            return;
        }

        // Iterate through all localStorage items
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);

            const row = document.createElement('tr');

            // Key cell
            const keyCell = document.createElement('td');
            keyCell.textContent = key;

            // Value cell
            const valueCell = document.createElement('td');
            const valueDiv = document.createElement('div');
            valueDiv.className = 'data-value';

            // Try to parse and format JSON values
            try {
                const parsed = JSON.parse(value);
                valueDiv.textContent = JSON.stringify(parsed, null, 2);
            } catch {
                valueDiv.textContent = value;
            }
            valueCell.appendChild(valueDiv);

            // Actions cell
            const actionsCell = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'admin-btn btn-clear';
            deleteBtn.textContent = 'Ta bort';
            deleteBtn.style.padding = '5px 10px';
            deleteBtn.style.fontSize = '0.85rem';
            deleteBtn.onclick = () => this.deleteLocalStorageItem(key);
            actionsCell.appendChild(deleteBtn);

            row.appendChild(keyCell);
            row.appendChild(valueCell);
            row.appendChild(actionsCell);
            table.appendChild(row);
        }
    }

    deleteLocalStorageItem(key) {
        if (confirm(`Vill du verkligen ta bort "${key}"?`)) {
            localStorage.removeItem(key);
            this.refreshData();
        }
    }

    clearLocalStorage() {
        if (confirm('Vill du verkligen rensa ALL localStorage? Detta kan inte ångras!')) {
            if (confirm('Är du HELT säker? All speldata kommer försvinna!')) {
                localStorage.clear();
                this.refreshData();
                alert('LocalStorage har rensats');
            }
        }
    }

    exportLocalStorage() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            try {
                data[key] = JSON.parse(value);
            } catch {
                data[key] = value;
            }
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `localStorage_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async loadPlayers() {
        try {
            const db = firebase.firestore();
            const playersSnapshot = await db.collection('players').get();
            const players = [];

            // Get all challenges once for counting
            const challengesSnapshot = await db.collection('challenges').get();
            const challenges = challengesSnapshot.docs.map(doc => doc.data());

            playersSnapshot.forEach(doc => {
                const playerData = doc.data();
                const playerId = playerData.playerId || doc.id;

                // Count challenges for this player
                const asChallenger = challenges.filter(c => c.challenger?.playerId === playerId).length;
                const asOpponent = challenges.filter(c => c.opponent?.playerId === playerId).length;

                players.push({
                    id: doc.id,
                    ...playerData,
                    // Override stats with real counts
                    stats: {
                        challengesCreated: asChallenger,
                        challengesPlayed: asOpponent
                    }
                });
            });

            // Sort by lastSeen (newest first)
            players.sort((a, b) => {
                const dateA = a.lastSeen?.toDate ? a.lastSeen.toDate() : new Date(0);
                const dateB = b.lastSeen?.toDate ? b.lastSeen.toDate() : new Date(0);
                return dateB - dateA;
            });

            this.displayPlayers(players);
        } catch (error) {
            console.error('Failed to load players:', error);
        }
    }

    displayPlayers(players) {
        let playersHtml = `
            <h3>Spelare (${players.length})</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Namn</th>
                        <th>Player ID</th>
                        <th>Skapad</th>
                        <th>Senast sedd</th>
                        <th>Utmaningar</th>
                        <th>Åtgärd</th>
                    </tr>
                </thead>
                <tbody>
        `;

        players.forEach(player => {
            const created = player.created?.toDate ? player.created.toDate().toLocaleString('sv-SE') : '-';
            const lastSeen = player.lastSeen?.toDate ? player.lastSeen.toDate().toLocaleString('sv-SE') : '-';
            const stats = player.stats || {};
            const playerId = player.playerId || player.id;

            playersHtml += `
                <tr>
                    <td>${player.name || '-'}</td>
                    <td class="monospace">${playerId}</td>
                    <td>${created}</td>
                    <td>${lastSeen}</td>
                    <td>Skapade: ${stats.challengesCreated || 0}, Spelade: ${stats.challengesPlayed || 0}</td>
                    <td style="display: flex; gap: 5px;">
                        <button onclick="window.adminPanel.quickSwitchPlayer('${playerId}')"
                                class="action-btn btn-primary"
                                style="padding: 2px 8px; font-size: 11px;">
                            Använd
                        </button>
                        <button onclick="window.adminPanel.deletePlayer('${playerId}', '${player.name || 'Okänd'}')"
                                class="action-btn btn-danger"
                                style="padding: 2px 8px; font-size: 11px;">
                            Ta bort
                        </button>
                    </td>
                </tr>
            `;
        });

        playersHtml += `
                </tbody>
            </table>
        `;

        // Add to existing container or create new one
        const existingContainer = document.getElementById('playersContent');
        if (existingContainer) {
            existingContainer.innerHTML = playersHtml;
        } else {
            const container = document.createElement('div');
            container.id = 'playersContent';
            container.className = 'section';
            container.innerHTML = playersHtml;

            const firebaseSection = document.getElementById('firebaseContent');
            if (firebaseSection) {
                firebaseSection.parentNode.insertBefore(container, firebaseSection);
            }
        }
    }

    async loadFirebaseData() {
        const container = document.getElementById('firebaseContent');

        // Check if Firebase is initialized
        if (typeof firebase === 'undefined' || !firebaseInitialized) {
            container.innerHTML = '<div class="empty-state">Firebase är inte konfigurerat eller initialiserat</div>';
            return;
        }

        // Load both challenges and players
        await this.loadPlayers();

        try {
            container.innerHTML = '<div class="empty-state">Laddar Firebase-data...</div>';

            // Get all challenges from Firebase
            const snapshot = await db.collection('challenges').get();

            if (snapshot.empty) {
                container.innerHTML = '<div class="empty-state">Inga challenges i Firebase</div>';
                return;
            }

            this.firebaseData = [];
            snapshot.forEach(doc => {
                this.firebaseData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`📊 Loaded ${this.firebaseData.length} challenges from Firebase`);

            // Sort by creation date (newest first)
            // FIX: Use 'created' field, not 'createdAt'
            this.firebaseData.sort((a, b) => {
                const dateA = a.created?.toDate ? a.created.toDate() : new Date(0);
                const dateB = b.created?.toDate ? b.created.toDate() : new Date(0);
                return dateB - dateA;
            });

            this.displayFirebaseData();
            this.updateStatistics();
        } catch (error) {
            console.error('Error loading Firebase data:', error);
            container.innerHTML = `<div class="empty-state">Fel vid laddning av Firebase-data: ${error.message}</div>`;
        }
    }

    renderQuestions(challenge) {
        if (!challenge.questions || challenge.questions.length === 0) {
            return '<p style="color: #999;">Inga frågor att visa</p>';
        }

        const challengerScores = challenge.challenger?.questionScores || [];
        const opponentScores = challenge.opponent?.questionScores || [];

        let html = `
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">#</th>
                        <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Typ</th>
                        <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Svårighet</th>
                        <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Fråga</th>
                        <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">${challenge.challenger?.name || 'Challenger'}</th>
                        <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">${challenge.opponent?.name || 'Opponent'}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        challenge.questions.forEach((q, i) => {
            const typeIcon = q.typ === 'ordna' ? '🔢' : '✅';
            const difficultyColor = {
                'lätt': '#4CAF50',
                'medel': '#FF9800',
                'svår': '#f44336'
            }[q.svårighetsgrad] || '#999';

            const challengerScore = challengerScores[i] || 0;
            const opponentScore = opponentScores[i] || 0;

            html += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${i + 1}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${typeIcon}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">
                        <span style="color: ${difficultyColor}; font-weight: bold;">
                            ${q.svårighetsgrad || 'okänd'}
                        </span>
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${q.fråga}
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;
                               background: ${challengerScore > 0 ? '#e8f5e9' : '#ffebee'};">
                        ${challengerScore}p
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;
                               background: ${opponentScore > 0 ? '#e8f5e9' : '#ffebee'};">
                        ${opponentScore !== undefined ? opponentScore + 'p' : '-'}
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        return html;
    }

    toggleQuestions(challengeId) {
        const questionsDiv = document.getElementById(`questions-${challengeId}`);
        const toggleIcon = document.getElementById(`toggle-icon-${challengeId}`);

        if (questionsDiv) {
            if (questionsDiv.style.display === 'none') {
                questionsDiv.style.display = 'block';
                if (toggleIcon) toggleIcon.textContent = '▼';
            } else {
                questionsDiv.style.display = 'none';
                if (toggleIcon) toggleIcon.textContent = '▶';
            }
        }
    }

    copyJSON(challengeId) {
        const challengeElements = document.querySelectorAll('.challenge-item');
        let challengeData = null;

        challengeElements.forEach(elem => {
            if (elem.innerHTML.includes(challengeId)) {
                const dataStr = elem.dataset.challengeData;
                if (dataStr) {
                    challengeData = JSON.parse(dataStr);
                }
            }
        });

        if (challengeData) {
            const jsonStr = JSON.stringify(challengeData, null, 2);
            navigator.clipboard.writeText(jsonStr).then(() => {
                alert('Challenge-data kopierad till urklipp!');
            }).catch(err => {
                alert('Kunde inte kopiera: ' + err);
            });
        }
    }

    displayFirebaseData() {
        const container = document.getElementById('firebaseContent');
        container.innerHTML = '';

        if (this.firebaseData.length === 0) {
            container.innerHTML = '<div class="empty-state">Inga challenges att visa</div>';
            return;
        }

        // Add summary header
        const summaryDiv = document.createElement('div');
        summaryDiv.style.cssText = 'padding: 10px; background: #f0f9ff; border-left: 4px solid #2196F3; border-radius: 4px; margin-bottom: 15px;';
        summaryDiv.innerHTML = `
            <strong>📊 Visar ${this.firebaseData.length} challenges</strong>
            <span style="color: #666; margin-left: 10px;">
                (${this.firebaseData.filter(c => c.opponent?.totalScore !== undefined).length} slutförda,
                ${this.firebaseData.filter(c => c.opponent?.totalScore === undefined).length} väntande)
            </span>
        `;
        container.appendChild(summaryDiv);

        this.firebaseData.forEach(challenge => {
            const challengeDiv = document.createElement('div');
            challengeDiv.className = 'challenge-item';

            const status = challenge.opponent?.totalScore !== undefined ? 'completed' : 'pending';
            const isCompleted = status === 'completed';

            // Format dates
            const createdDate = challenge.created?.toDate ?
                new Date(challenge.created.toDate()).toLocaleString('sv-SE') :
                (challenge.created ? new Date(challenge.created).toLocaleString('sv-SE') : 'Okänt datum');

            const expiresDate = challenge.expires?.toDate ?
                new Date(challenge.expires.toDate()).toLocaleString('sv-SE') :
                (challenge.expires ? new Date(challenge.expires).toLocaleString('sv-SE') : 'Okänt datum');

            // Get completion dates
            const challengerCompletedDate = challenge.challenger?.completedAt?.toDate ?
                new Date(challenge.challenger.completedAt.toDate()).toLocaleString('sv-SE') :
                (challenge.challenger?.completedAt ? new Date(challenge.challenger.completedAt).toLocaleString('sv-SE') : 'N/A');

            const opponentCompletedDate = challenge.opponent?.completedAt?.toDate ?
                new Date(challenge.opponent.completedAt.toDate()).toLocaleString('sv-SE') :
                (challenge.opponent?.completedAt ? new Date(challenge.opponent.completedAt).toLocaleString('sv-SE') : 'N/A');

            // Calculate time difference if both completed
            let timeDiff = '';
            if (challenge.challenger?.completedAt && challenge.opponent?.completedAt) {
                const challengerTime = challenge.challenger.completedAt.toDate ?
                    challenge.challenger.completedAt.toDate() : new Date(challenge.challenger.completedAt);
                const opponentTime = challenge.opponent.completedAt.toDate ?
                    challenge.opponent.completedAt.toDate() : new Date(challenge.opponent.completedAt);

                const diffMs = Math.abs(opponentTime - challengerTime);
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                if (diffHours > 0) {
                    timeDiff = `${diffHours}h ${diffMinutes}min mellan spelare`;
                } else {
                    timeDiff = `${diffMinutes}min mellan spelare`;
                }
            }

            // Calculate winner if completed
            let winnerText = '';
            let scoreDiff = 0;
            if (isCompleted && challenge.challenger && challenge.opponent) {
                const challengerScore = challenge.challenger.totalScore || 0;
                const opponentScore = challenge.opponent.totalScore || 0;
                scoreDiff = Math.abs(challengerScore - opponentScore);

                if (challengerScore > opponentScore) {
                    winnerText = `🏆 ${challenge.challenger.name} vann med ${scoreDiff}p`;
                } else if (opponentScore > challengerScore) {
                    winnerText = `🏆 ${challenge.opponent.name} vann med ${scoreDiff}p`;
                } else {
                    winnerText = '🤝 Oavgjort';
                }
            }

            // Format questionScores arrays
            const formatScores = (scores) => {
                if (!scores || scores.length === 0) return 'Inga poäng';
                return scores.map((s, i) => `F${i+1}:${s}`).join(' ');
            };

            challengeDiv.innerHTML = `
                <div class="challenge-header">
                    <span class="challenge-id">ID: ${challenge.id}</span>
                    <span class="challenge-status status-${status}">
                        ${status === 'completed' ? 'Slutförd' : 'Väntar'}
                    </span>
                </div>
                ${winnerText ? `<div style="text-align: center; padding: 10px; background: #f0f9ff; border-radius: 5px; margin: 10px 0; font-weight: bold;">${winnerText}</div>` : ''}
                <div class="challenge-details">
                    <div class="detail-item">
                        <span class="detail-label">Utmanare</span>
                        <span class="detail-value">${challenge.challenger?.name || 'Okänd'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Utmanarens Player ID</span>
                        <span class="detail-value" style="font-family: monospace; font-size: 0.85rem;">
                            ${challenge.challenger?.playerId || 'Saknas (gammal challenge)'}
                            ${challenge.challenger?.playerId ? `
                                <button onclick="window.adminPanel.quickSwitchPlayer('${challenge.challenger.playerId}')"
                                        style="margin-left: 10px; padding: 2px 6px; font-size: 10px; cursor: pointer;">
                                    Använd
                                </button>
                            ` : ''}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Utmanarens poäng</span>
                        <span class="detail-value" style="font-weight: bold; color: ${isCompleted && challenge.challenger?.totalScore > challenge.opponent?.totalScore ? 'green' : 'inherit'};">
                            ${challenge.challenger?.totalScore || 0}p
                        </span>
                    </div>
                    ${challenge.challenger?.questionScores ? `
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span class="detail-label">Utmanarens poängfördelning</span>
                        <span class="detail-value" style="font-family: monospace; font-size: 0.9rem;">
                            ${formatScores(challenge.challenger.questionScores)}
                        </span>
                    </div>` : ''}
                    <div class="detail-item">
                        <span class="detail-label">Motståndare</span>
                        <span class="detail-value">${challenge.opponent?.name || 'Väntar...'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Motståndarens Player ID</span>
                        <span class="detail-value" style="font-family: monospace; font-size: 0.85rem;">
                            ${challenge.opponent?.playerId || (challenge.opponent ? 'Saknas (gammal challenge)' : 'Väntar...')}
                            ${challenge.opponent?.playerId ? `
                                <button onclick="window.adminPanel.quickSwitchPlayer('${challenge.opponent.playerId}')"
                                        style="margin-left: 10px; padding: 2px 6px; font-size: 10px; cursor: pointer;">
                                    Använd
                                </button>
                            ` : ''}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Motståndarens poäng</span>
                        <span class="detail-value" style="font-weight: bold; color: ${isCompleted && challenge.opponent?.totalScore > challenge.challenger?.totalScore ? 'green' : 'inherit'};">
                            ${challenge.opponent?.totalScore !== undefined ? challenge.opponent.totalScore + 'p' : '-'}
                        </span>
                    </div>
                    ${challenge.opponent?.questionScores ? `
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span class="detail-label">Motståndarens poängfördelning</span>
                        <span class="detail-value" style="font-family: monospace; font-size: 0.9rem;">
                            ${formatScores(challenge.opponent.questionScores)}
                        </span>
                    </div>` : ''}
                    <div class="detail-item">
                        <span class="detail-label">Frågepaket</span>
                        <span class="detail-value">${challenge.packName || 'Standard'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <span class="detail-value">${challenge.status || 'pending'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Skapad</span>
                        <span class="detail-value">${createdDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Utgår</span>
                        <span class="detail-value">${expiresDate}</span>
                    </div>
                    ${challenge.challenger?.completedAt ? `
                    <div class="detail-item">
                        <span class="detail-label">Challenger spelade</span>
                        <span class="detail-value" style="font-size: 0.85rem;">${challengerCompletedDate}</span>
                    </div>` : ''}
                    ${challenge.opponent?.completedAt ? `
                    <div class="detail-item">
                        <span class="detail-label">Opponent spelade</span>
                        <span class="detail-value" style="font-size: 0.85rem;">${opponentCompletedDate}</span>
                    </div>` : ''}
                    ${timeDiff ? `
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span class="detail-label">Tidsskillnad</span>
                        <span class="detail-value" style="color: #666; font-style: italic;">${timeDiff}</span>
                    </div>` : ''}
                    <div class="detail-item">
                        <span class="detail-label">Antal frågor</span>
                        <span class="detail-value">${challenge.questions ? challenge.questions.length : 0}</span>
                    </div>
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span class="detail-label">Delningslänk</span>
                        <span class="detail-value" style="font-size: 0.8rem; word-break: break-all;">
                            <a href="${window.location.origin}/?challenge=${challenge.id}" target="_blank">
                                ${window.location.origin}/?challenge=${challenge.id}
                            </a>
                        </span>
                    </div>
                </div>

                <!-- Expandable Questions Section -->
                <div style="border-top: 1px solid #e0e0e0; margin-top: 15px; padding-top: 10px;">
                    <button onclick="window.adminPanel.toggleQuestions('${challenge.id}')"
                            style="background: #2196F3; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-bottom: 10px;">
                        <span id="toggle-icon-${challenge.id}">▶</span> Visa frågor (${challenge.questions ? challenge.questions.length : 0})
                    </button>
                    <div id="questions-${challenge.id}" style="display: none; margin-top: 10px;">
                        ${this.renderQuestions(challenge)}
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="border-top: 1px solid #e0e0e0; margin-top: 15px; padding-top: 10px; display: flex; gap: 10px;">
                    <button onclick="window.adminPanel.copyJSON('${challenge.id}')"
                            style="background: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                        📋 Kopiera JSON
                    </button>
                </div>
            `;

            // Store challenge data for later use
            challengeDiv.dataset.challengeData = JSON.stringify(challenge);

            container.appendChild(challengeDiv);
        });
    }

    exportFirebaseData() {
        if (this.firebaseData.length === 0) {
            alert('Ingen Firebase-data att exportera');
            return;
        }

        const blob = new Blob([JSON.stringify(this.firebaseData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `firebase_challenges_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    updateStatistics() {
        const statsGrid = document.getElementById('statsGrid');

        // Calculate statistics
        const localStorageCount = localStorage.length;
        const challengeCount = this.firebaseData.length;

        // FIX: Use correct field structure (opponent.totalScore, not opponentScore)
        const pendingChallenges = this.firebaseData.filter(c =>
            c.opponent?.totalScore === undefined).length;
        const completedChallenges = this.firebaseData.filter(c =>
            c.opponent?.totalScore !== undefined).length;

        // Get player info from Firebase Auth (not just localStorage)
        const playerName = localStorage.getItem('playerName');
        const playerId = window.getCurrentPlayerId ? window.getCurrentPlayerId() : 'Not authenticated';
        const isDummy = playerName && playerName.startsWith('Spelare_');

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${localStorageCount}</div>
                <div class="stat-label">LocalStorage-poster</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${challengeCount}</div>
                <div class="stat-label">Firebase challenges</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${pendingChallenges}</div>
                <div class="stat-label">Väntande challenges</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${completedChallenges}</div>
                <div class="stat-label">Slutförda challenges</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${playerName || 'Ej satt'}</div>
                <div class="stat-label">Spelarnamn ${isDummy ? '(Dummy)' : ''}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="font-size: 0.9rem; word-break: break-all;">${playerId}</div>
                <div class="stat-label">Player ID</div>
            </div>
        `;
    }

    // Switch to a different player
    async switchToPlayer() {
        const input = document.getElementById('switchPlayerInput');
        const resultDiv = document.getElementById('switchPlayerResult');
        const playerId = input.value.trim();

        if (!playerId) {
            resultDiv.innerHTML = '<div style="color: red;">⚠️ Ange ett Player ID</div>';
            return;
        }

        try {
            resultDiv.innerHTML = '<div style="color: blue;">⏳ Verifierar Player ID...</div>';

            // Check if FirebaseAPI is available
            if (typeof FirebaseAPI === 'undefined' || !FirebaseAPI.verifyPlayerId) {
                throw new Error('Firebase är inte tillgängligt');
            }

            // Verify player exists in Firebase (works for both old and new format)
            const playerData = await FirebaseAPI.verifyPlayerId(playerId);

            if (playerData) {
                // Save to localStorage - This will work for both old player_xxx and new Firebase UIDs
                localStorage.setItem('playerId', playerData.playerId || playerId);
                localStorage.setItem('playerName', playerData.name || 'Okänd spelare');

                resultDiv.innerHTML = `
                    <div style="color: green;">
                        ✅ Bytte till: <strong>${playerData.name}</strong>
                        <br><small>(${playerData.playerId || playerId})</small>
                        <br><br>Laddar om till huvudsidan...
                    </div>
                `;

                // Redirect to main page after 1.5 seconds
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                resultDiv.innerHTML = '<div style="color: red;">❌ Player ID hittades inte i Firebase</div>';
            }
        } catch (error) {
            console.error('Error switching player:', error);
            resultDiv.innerHTML = `<div style="color: red;">❌ Fel: ${error.message}</div>`;
        }
    }

    // Quick switch from players table
    async quickSwitchPlayer(playerId) {
        const input = document.getElementById('switchPlayerInput');
        if (input) {
            input.value = playerId;
            await this.switchToPlayer();
        }
    }

    // Toggle section collapse/expand
    toggleSection(titleElement) {
        const content = titleElement.nextElementSibling;
        const icon = titleElement.querySelector('.toggle-icon');

        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            titleElement.classList.remove('collapsed');
        } else {
            content.classList.add('collapsed');
            titleElement.classList.add('collapsed');
        }
    }

    // Load feedback from Firebase
    async loadFeedback() {
        const listDiv = document.getElementById('feedbackList');
        if (!listDiv) return;

        listDiv.innerHTML = '<div style="color: #666;">Laddar feedback...</div>';

        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('feedback')
                .orderBy('timestamp', 'desc')
                .get();

            if (snapshot.empty) {
                listDiv.innerHTML = '<div style="color: #666;">Ingen feedback än.</div>';
                return;
            }

            // Store feedback for filtering
            this.allFeedback = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.renderFeedback(this.allFeedback);

        } catch (error) {
            console.error('Failed to load feedback:', error);
            listDiv.innerHTML = '<div style="color: red;">❌ Kunde inte ladda feedback: ' + error.message + '</div>';
        }
    }

    // Render feedback list
    renderFeedback(feedbackList) {
        const listDiv = document.getElementById('feedbackList');
        if (!feedbackList || feedbackList.length === 0) {
            listDiv.innerHTML = '<div style="color: #666;">Ingen feedback matchar filtret.</div>';
            return;
        }

        const categoryEmoji = {
            bug: '🐛',
            question: '❓',
            suggestion: '💡',
            other: '💬'
        };

        const statusBadge = {
            new: '<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">NY</span>',
            read: '<span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">LÄST</span>',
            resolved: '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">LÖST</span>'
        };

        let html = '';
        feedbackList.forEach(feedback => {
            const date = feedback.timestamp ? new Date(feedback.timestamp.seconds * 1000).toLocaleString('sv-SE') : 'Okänt datum';
            const status = feedback.status || 'new';

            html += `
                <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: ${status === 'new' ? '#f0f9ff' : 'white'};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <strong>${categoryEmoji[feedback.category] || '💬'} ${feedback.category.toUpperCase()}</strong>
                            ${statusBadge[status]}
                        </div>
                        <small style="color: #666;">${date}</small>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>Från:</strong> ${feedback.playerName} (${feedback.playerId.substring(0, 20)}...)
                    </div>
                    <div style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb; white-space: pre-wrap;">
                        ${feedback.message}
                    </div>
                    <div style="margin-top: 10px; display: flex; gap: 10px;">
                        ${status === 'new' ? `<button onclick="window.adminPanel.updateFeedbackStatus('${feedback.id}', 'read')" class="admin-btn btn-primary" style="font-size: 0.875rem; padding: 6px 12px;">Markera som läst</button>` : ''}
                        ${status === 'read' ? `<button onclick="window.adminPanel.updateFeedbackStatus('${feedback.id}', 'resolved')" class="admin-btn btn-success" style="font-size: 0.875rem; padding: 6px 12px;">Markera som löst</button>` : ''}
                        ${status === 'resolved' ? `<button onclick="window.adminPanel.updateFeedbackStatus('${feedback.id}', 'new')" class="admin-btn" style="font-size: 0.875rem; padding: 6px 12px;">Återställ till ny</button>` : ''}
                        <button onclick="window.adminPanel.deleteFeedback('${feedback.id}')" class="admin-btn btn-danger" style="font-size: 0.875rem; padding: 6px 12px;">Radera</button>
                    </div>
                    <details style="margin-top: 10px;">
                        <summary style="cursor: pointer; color: #666; font-size: 0.875rem;">Teknisk info</summary>
                        <div style="font-size: 0.75rem; color: #666; margin-top: 5px; font-family: monospace;">
                            <div>URL: ${feedback.url || 'N/A'}</div>
                            <div>User Agent: ${feedback.userAgent ? feedback.userAgent.substring(0, 100) + '...' : 'N/A'}</div>
                        </div>
                    </details>
                </div>
            `;
        });

        listDiv.innerHTML = html;
    }

    // Filter feedback
    filterFeedback() {
        if (!this.allFeedback) return;

        const statusFilter = document.getElementById('feedbackFilter').value;
        const categoryFilter = document.getElementById('feedbackCategoryFilter').value;

        let filtered = this.allFeedback;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(f => (f.status || 'new') === statusFilter);
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(f => f.category === categoryFilter);
        }

        this.renderFeedback(filtered);
    }

    // Update feedback status
    async updateFeedbackStatus(feedbackId, newStatus) {
        try {
            const db = firebase.firestore();
            await db.collection('feedback').doc(feedbackId).update({
                status: newStatus
            });

            console.log(`✅ Feedback ${feedbackId} status updated to ${newStatus}`);
            await this.loadFeedback(); // Reload to show changes

        } catch (error) {
            console.error('Failed to update feedback status:', error);
            alert('❌ Kunde inte uppdatera status: ' + error.message);
        }
    }

    // Delete feedback
    async deleteFeedback(feedbackId) {
        if (!confirm('Är du säker på att du vill radera denna feedback?')) {
            return;
        }

        try {
            const db = firebase.firestore();
            await db.collection('feedback').doc(feedbackId).delete();

            console.log(`✅ Feedback ${feedbackId} deleted`);
            await this.loadFeedback(); // Reload to show changes

        } catch (error) {
            console.error('Failed to delete feedback:', error);
            alert('❌ Kunde inte radera feedback: ' + error.message);
        }
    }

    // Delete a player from Firebase (with all related data)
    async deletePlayer(playerId, playerName) {
        // Double-confirm (critical operation)
        if (!confirm(`⚠️ Vill du verkligen ta bort spelaren "${playerName}"?\n\nDetta kommer att radera:\n- Spelarprofilen\n- Alla spelade paket (playedPacks subcollection)\n- PlayerIds från challenges (namn behålls för historik)\n\nDetta kan INTE ångras!`)) {
            return;
        }

        if (!confirm(`Är du HELT säker? Detta är en permanent operation för "${playerName}".`)) {
            return;
        }

        try {
            const db = firebase.firestore();

            // 1. Delete playedPacks subcollection (batch delete)
            const packsSnapshot = await db.collection('players')
                .doc(playerId)
                .collection('playedPacks')
                .get();

            const batch = db.batch();
            packsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`✅ Deleted ${packsSnapshot.size} played packs for ${playerId}`);

            // 2. Delete player document
            await db.collection('players').doc(playerId).delete();
            console.log(`✅ Deleted player document: ${playerId}`);

            // 3. Update challenges - remove playerId references but keep names for history
            // (This is optional - we could also leave challenges as-is since they're historical)
            const challengesAsChallenger = await db.collection('challenges')
                .where('challenger.playerId', '==', playerId)
                .get();

            const challengesAsOpponent = await db.collection('challenges')
                .where('opponent.playerId', '==', playerId)
                .get();

            const updateBatch = db.batch();
            challengesAsChallenger.docs.forEach(doc => {
                updateBatch.update(doc.ref, {
                    'challenger.playerId': null,
                    'challenger.deleted': true
                });
            });
            challengesAsOpponent.docs.forEach(doc => {
                updateBatch.update(doc.ref, {
                    'opponent.playerId': null,
                    'opponent.deleted': true
                });
            });
            await updateBatch.commit();
            console.log(`✅ Updated ${challengesAsChallenger.size + challengesAsOpponent.size} challenges`);

            alert(`✅ Spelare "${playerName}" har tagits bort från Firebase!`);

            // Refresh displays
            await this.loadPlayers();
            await this.loadFirebaseData();

        } catch (error) {
            console.error('Failed to delete player:', error);
            alert(`❌ Kunde inte radera spelare: ${error.message}`);
        }
    }

    // Reset current player from localStorage (for testing new account flow)
    resetCurrentPlayer() {
        if (confirm('🧪 Rensa aktuell spelare från localStorage?\n\nDetta rensar:\n- playerId\n- playerName\n\nNästa besök på huvudsidan → tvingar nytt konto-flöde.')) {
            const oldPlayerId = localStorage.getItem('playerId');
            const oldPlayerName = localStorage.getItem('playerName');

            localStorage.removeItem('playerId');
            localStorage.removeItem('playerName');

            console.log('🧪 Test reset:', { oldPlayerId, oldPlayerName });

            alert(`✅ Rensat!\n\nTidigare: ${oldPlayerName} (${oldPlayerId})\n\n→ Gå till huvudsidan för att skapa nytt konto.`);

            // Refresh statistics to show changes
            this.refreshData();
        }
    }

    // Load played packs from Firebase
    async loadPlayedPacks() {
        const content = document.getElementById('playedPacksContent');
        content.innerHTML = '<p>Laddar...</p>';

        try {
            // FIX: Use getCurrentPlayerId() instead of localStorage
            const playerId = window.getCurrentPlayerId ? window.getCurrentPlayerId() : null;
            if (!playerId) {
                content.innerHTML = '<p style="color: orange;">⚠️ Ingen playerId (ej autentiserad med Firebase Auth)</p>';
                return;
            }

            const playedPacks = await window.FirebaseAPI.getPlayedPacks(playerId);

            if (Object.keys(playedPacks).length === 0) {
                content.innerHTML = '<p style="color: #666;">Inga spelade paket hittades för denna spelare.</p>';
                return;
            }

            let html = `
                <p style="margin-bottom: 15px;"><strong>Player ID:</strong> ${playerId}</p>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Pack ID</th>
                            <th>Gånger spelad</th>
                            <th>Bästa poäng</th>
                            <th>Senast spelad</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            for (const [packId, data] of Object.entries(playedPacks)) {
                const playedDate = data.playedAt?.toDate ? data.playedAt.toDate() : new Date(data.playedAt);
                const formattedDate = playedDate.toLocaleString('sv-SE');

                html += `
                    <tr>
                        <td><code>${packId}</code></td>
                        <td>${data.timesPlayed}</td>
                        <td><strong>${data.bestScore}</strong></td>
                        <td>${formattedDate}</td>
                    </tr>
                `;
            }

            html += `
                    </tbody>
                </table>
                <p style="margin-top: 15px; color: #666;">
                    <strong>Totalt antal paket:</strong> ${Object.keys(playedPacks).length}
                </p>
            `;

            content.innerHTML = html;
        } catch (error) {
            console.error('Failed to load played packs:', error);
            content.innerHTML = `<p style="color: red;">❌ Fel vid laddning: ${error.message}</p>`;
        }
    }
}

// Initialize admin panel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adminPanel = new AdminPanel();
    });
} else {
    window.adminPanel = new AdminPanel();
}