// Firebase Configuration for Ordna Game
// Note: Replace with actual config values from Firebase Console

const firebaseConfig = {
    // TODO: Replace these with your actual Firebase config
    // Get these from: Firebase Console > Project Settings > General > Your apps
    apiKey: "REPLACE_WITH_YOUR_API_KEY",
    authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN", 
    projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
    storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
    messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
    appId: "REPLACE_WITH_YOUR_APP_ID"
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
    // Create a new challenge
    async createChallenge(challengerName, challengerId) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Challenge would be created in Firebase');
            return 'demo_challenge_' + Date.now();
        }

        try {
            const challengeId = 'challenge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            await db.collection('challenges').doc(challengeId).set({
                id: challengeId,
                challengerName: challengerName,
                challengerId: challengerId,
                createdAt: new Date(),
                status: 'waiting'
            });

            console.log('Challenge created:', challengeId);
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

    // Complete a challenge with result
    async completeChallenge(challengeId, playerName, playerId, score, totalQuestions) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Challenge completed', {challengeId, playerName, score});
            return;
        }

        try {
            await db.collection('challenges').doc(challengeId).update({
                status: 'completed',
                result: {
                    playerName: playerName,
                    playerId: playerId,
                    score: score,
                    totalQuestions: totalQuestions,
                    completedAt: new Date()
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
    async getNewCompletedChallenges(playerId, lastCheckTime) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Would check for new results');
            return [];
        }

        try {
            let query = db.collection('challenges')
                .where('challengerId', '==', playerId)
                .where('status', '==', 'completed');

            if (lastCheckTime) {
                query = query.where('result.completedAt', '>', lastCheckTime);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error checking for new results:', error);
            return [];
        }
    }
};

// Initialize Firebase when script loads
initializeFirebase();