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

    showAdminPanel() {
        // Check session timeout (30 minutes)
        const authTime = sessionStorage.getItem('adminAuthTime');
        if (authTime && (Date.now() - parseInt(authTime) > 30 * 60 * 1000)) {
            sessionStorage.removeItem('adminAuthenticated');
            sessionStorage.removeItem('adminAuthTime');
            location.reload();
            return;
        }

        this.authenticated = true;
        document.getElementById('authOverlay').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        this.refreshData();
        this.loadFirebaseData();
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

    async loadFirebaseData() {
        const container = document.getElementById('firebaseContent');

        // Check if Firebase is initialized
        if (typeof firebase === 'undefined' || !firebaseInitialized) {
            container.innerHTML = '<div class="empty-state">Firebase är inte konfigurerat eller initialiserat</div>';
            return;
        }

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

            // Sort by creation date (newest first)
            this.firebaseData.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
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
        const pendingChallenges = this.firebaseData.filter(c => c.opponentScore === undefined).length;
        const completedChallenges = this.firebaseData.filter(c => c.opponentScore !== undefined).length;

        // Count local challenges
        let localChallengeCount = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('challenge_')) {
                localChallengeCount++;
            }
        }

        // Get player info
        const playerName = localStorage.getItem('playerName');

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${localStorageCount}</div>
                <div class="stat-label">LocalStorage-poster</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${localChallengeCount}</div>
                <div class="stat-label">Lokala challenges</div>
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
                <div class="stat-label">Spelarnamn</div>
            </div>
        `;
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