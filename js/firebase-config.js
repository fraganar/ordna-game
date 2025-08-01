// Firebase Configuration for Ordna Game
// Note: Replace with actual config values from Firebase Console

const firebaseConfig = {
    apiKey: "AIzaSyArJzldXQqiFLgxCpJrI1PaoqJ9SYYnoLo",
    authDomain: "ordna-game.firebaseapp.com",
    projectId: "ordna-game",
    storageBucket: "ordna-game.firebasestorage.app",
    messagingSenderId: "495272269343",
    appId: "1:495272269343:web:3ff7bbf932c14bbcf4e72a"
};

// Initialize Firebase
let db = null;
let firebaseInitialized = false;

function initializeFirebase() {
    try {
        // Check if Firebase is loaded
        if (typeof firebase === 'undefined') {
            console.error('Firebase not loaded. Make sure Firebase CDN scripts are included.');
            return false;
        }

        // Check if config is set up
        if (firebaseConfig.apiKey === "REPLACE_WITH_YOUR_API_KEY") {
            console.warn('Firebase not configured. Running in demo mode.');
            console.warn('To enable Firebase: Update firebase-config.js with your project settings');
            return false;
        }

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseInitialized = true;
        
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        return false;
    }
}

// Firebase helper functions
const FirebaseAPI = {
    // Create a new challenge with questions
    async createChallenge(challengerName, challengerId, questions, challengerScore, questionScores, packName = null) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Challenge would be created in Firebase');
            return 'demo_challenge_' + Date.now();
        }

        try {
            const challengeId = 'challenge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const created = new Date();
            const expires = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
            
            const challengeData = {
                id: challengeId,
                created: created,
                expires: expires,
                status: 'pending',
                questions: questions,
                challenger: {
                    name: challengerName,
                    completedAt: created,
                    totalScore: challengerScore,
                    questionScores: questionScores
                },
                opponent: null
            };
            
            // Add pack info if specified
            if (packName) {
                challengeData.packName = packName;
            }
            
            await db.collection('challenges').doc(challengeId).set(challengeData);

            console.log('Challenge created:', challengeId, packName ? `with pack: ${packName}` : 'with all questions');
            return challengeId;
        } catch (error) {
            console.error('Error creating challenge:', error);
            throw error;
        }
    },

    // Get challenge details
    async getChallenge(challengeId) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Would fetch challenge', challengeId);
            return {
                id: challengeId,
                challengerName: 'Demo Challenger',
                status: 'waiting',
                createdAt: new Date()
            };
        }

        try {
            const doc = await db.collection('challenges').doc(challengeId).get();
            
            if (doc.exists) {
                return doc.data();
            } else {
                throw new Error('Challenge not found');
            }
        } catch (error) {
            console.error('Error getting challenge:', error);
            throw error;
        }
    },

    // Complete a challenge as opponent
    async completeChallenge(challengeId, playerName, playerScore, questionScores) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Challenge completed', {challengeId, playerName, playerScore});
            return;
        }

        try {
            await db.collection('challenges').doc(challengeId).update({
                status: 'complete',
                opponent: {
                    name: playerName,
                    completedAt: new Date(),
                    totalScore: playerScore,
                    questionScores: questionScores
                }
            });

            console.log('Challenge completed:', challengeId);
        } catch (error) {
            console.error('Error completing challenge:', error);
            throw error;
        }
    },

    // Get challenges created by a player (for notifications)
    async getPlayerChallenges(playerId) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Would fetch challenges for player', playerId);
            return [];
        }

        try {
            const snapshot = await db.collection('challenges')
                .where('challengerId', '==', playerId)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting player challenges:', error);
            throw error;
        }
    },

    // Get new completed challenges (for notifications)
    async getNewCompletedChallenges(playerName, lastCheckTime) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Would check for new results');
            return [];
        }

        try {
            let query = db.collection('challenges')
                .where('challenger.name', '==', playerName)
                .where('status', '==', 'complete');

            if (lastCheckTime) {
                query = query.where('opponent.completedAt', '>', lastCheckTime);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error checking for new results:', error);
            return [];
        }
    },

    // Get all challenges for a player (both as challenger and opponent)
    async getMyChallenges(playerName) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Would fetch my challenges');
            return [];
        }

        try {
            // Get challenges where player is challenger
            const asChallenger = await db.collection('challenges')
                .where('challenger.name', '==', playerName)
                .orderBy('created', 'desc')
                .limit(20)
                .get();

            // Get challenges where player is opponent (completed)
            const asOpponent = await db.collection('challenges')
                .where('opponent.name', '==', playerName)
                .orderBy('opponent.completedAt', 'desc')
                .limit(20)
                .get();

            const challenges = [
                ...asChallenger.docs.map(doc => ({ ...doc.data(), role: 'challenger' })),
                ...asOpponent.docs.map(doc => ({ ...doc.data(), role: 'opponent' }))
            ];

            // Sort by most recent activity
            challenges.sort((a, b) => {
                const aTime = a.role === 'challenger' ? a.created : a.opponent.completedAt;
                const bTime = b.role === 'challenger' ? b.created : b.opponent.completedAt;
                return bTime - aTime;
            });

            return challenges;
        } catch (error) {
            console.error('Error getting my challenges:', error);
            return [];
        }
    }
};

// Initialize Firebase when script loads
initializeFirebase();