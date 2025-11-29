// Firebase Configuration for Tres Mangos
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
let auth = null;
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
        auth = firebase.auth();
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
    async createChallenge(challengerName, challengerId, questions, challengerScore, questionScores, packName = null, packId = null) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Challenge would be created in Firebase');
            return 'demo_challenge_' + Date.now();
        }

        try {
            // Debug logging
            console.log('createChallenge called with:', {
                challengerName,
                challengerId,
                questions: questions?.length,
                challengerScore,
                questionScores,
                packName,
                packId
            });

            const challengeId = 'challenge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const created = new Date();
            const expires = new Date(created.getTime() + 2 * 365 * 24 * 60 * 60 * 1000); // 2 years

            const challengeData = {
                id: challengeId,
                created: created,
                expires: expires,
                status: 'pending',
                questions: questions,
                challenger: {
                    playerId: challengerId,  // Added for player tracking
                    name: challengerName,
                    completedAt: created,
                    totalScore: challengerScore,
                    questionScores: questionScores
                },
                opponent: null
            };

            // Add pack info if specified
            if (packName) {
                challengeData.packName = packName;  // Keep for display
            }
            if (packId) {
                challengeData.packId = packId;      // For tracking played packs
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
    async completeChallenge(challengeId, playerId, playerName, playerScore, questionScores) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Challenge completed', {challengeId, playerName, playerScore});
            return;
        }

        try {
            await db.collection('challenges').doc(challengeId).update({
                status: 'completed',
                opponent: {
                    playerId: playerId,  // Added for player tracking
                    name: playerName,
                    completedAt: new Date(),
                    totalScore: playerScore,
                    questionScores: questionScores
                }
            });

            console.log('Challenge completed:', challengeId);

            // CRITICAL: Invalidate cache after challenge completion
            // This ensures "My Challenges" list updates immediately
            if (window.ChallengeSystem && typeof window.ChallengeSystem.invalidateCache === 'function') {
                window.ChallengeSystem.invalidateCache();
                console.log('Cache invalidated after challenge completion');
            }
        } catch (error) {
            console.error('Error completing challenge:', error);
            throw error;
        }
    },

    // Update an existing challenge (for migrations and corrections)
    async updateChallenge(challengeId, updates) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Would update challenge', challengeId, updates);
            return;
        }

        try {
            await db.collection('challenges').doc(challengeId).update(updates);
            console.log('Challenge updated:', challengeId);
        } catch (error) {
            console.error('Error updating challenge:', error);
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

    // Player management functions
    async upsertPlayer(playerId, playerName) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Would upsert player', playerId);
            return;
        }

        try {
            const playerRef = db.collection('players').doc(playerId);
            const doc = await playerRef.get();

            if (doc.exists) {
                // Update existing player
                const updateData = {
                    name: playerName,
                    lastSeen: new Date()
                };

                // Only update authProvider if we have it in localStorage
                const authProvider = localStorage.getItem('authProvider');
                if (authProvider) {
                    updateData.authProvider = authProvider;
                }

                await playerRef.update(updateData);
            } else {
                // Create new player
                const authProvider = localStorage.getItem('authProvider') || 'unknown';
                await playerRef.set({
                    playerId: playerId,
                    name: playerName,
                    created: new Date(),
                    lastSeen: new Date(),
                    authProvider: authProvider,
                    stats: {
                        challengesCreated: 0,
                        challengesPlayed: 0,
                        totalScore: 0
                    }
                });
            }
        } catch (error) {
            console.error('Error upserting player:', error);
            throw error;
        }
    },

    // Get player data
    async getPlayer(playerId) {
        if (!firebaseInitialized) {
            return null;
        }

        try {
            const doc = await db.collection('players').doc(playerId).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting player:', error);
            return null;
        }
    },

    // Verify that playerId exists (for account recovery)
    async verifyPlayerId(playerId) {
        if (!firebaseInitialized) {
            throw new Error('Firebase är inte tillgängligt');
        }

        try {
            const doc = await db.collection('players').doc(playerId).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error('Error verifying player:', error);
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
                .where('status', '==', 'completed');

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

    // Get challenges by playerId (both as challenger and opponent)
    async getUserChallenges(playerId) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Would fetch challenges for player', playerId);
            return [];
        }

        try {
            // Get challenges where user is challenger
            // Note: No limit - we fetch all and sort in client to ensure newest are included
            const asChallenger = await db.collection('challenges')
                .where('challenger.playerId', '==', playerId)
                .get();

            // Get challenges where user is opponent
            const asOpponent = await db.collection('challenges')
                .where('opponent.playerId', '==', playerId)
                .get();

            const challenges = [
                ...asChallenger.docs.map(doc => ({ ...doc.data(), role: 'challenger' })),
                ...asOpponent.docs.map(doc => ({ ...doc.data(), role: 'opponent' }))
            ];

            // Sort by most recent activity (handle missing dates)
            challenges.sort((a, b) => {
                const aTime = a.role === 'challenger'
                    ? (a.created?.toDate ? a.created.toDate() : new Date(a.created || 0))
                    : (a.opponent?.completedAt?.toDate ? a.opponent.completedAt.toDate() : new Date(a.opponent?.completedAt || 0));
                const bTime = b.role === 'challenger'
                    ? (b.created?.toDate ? b.created.toDate() : new Date(b.created || 0))
                    : (b.opponent?.completedAt?.toDate ? b.opponent.completedAt.toDate() : new Date(b.opponent?.completedAt || 0));
                return bTime - aTime;
            });

            return challenges;
        } catch (error) {
            console.error('Error getting user challenges:', error);
            return [];
        }
    },

    // Get all challenges for a player (both as challenger and opponent) - LEGACY using name
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

            // Sort by most recent activity (handle missing dates)
            challenges.sort((a, b) => {
                const aTime = a.role === 'challenger'
                    ? (a.created?.toDate ? a.created.toDate() : new Date(a.created || 0))
                    : (a.opponent?.completedAt?.toDate ? a.opponent.completedAt.toDate() : new Date(a.opponent?.completedAt || 0));
                const bTime = b.role === 'challenger'
                    ? (b.created?.toDate ? b.created.toDate() : new Date(b.created || 0))
                    : (b.opponent?.completedAt?.toDate ? b.opponent.completedAt.toDate() : new Date(b.opponent?.completedAt || 0));
                return bTime - aTime;
            });

            return challenges;
        } catch (error) {
            console.error('Error getting my challenges:', error);
            return [];
        }
    },

    // Track played pack for a player
    async updatePlayedPack(playerId, packId, score) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Would track played pack', packId);
            return;
        }

        try {
            const playerRef = db.collection('players').doc(playerId);
            const packRef = playerRef.collection('playedPacks').doc(packId);

            const doc = await packRef.get();

            if (doc.exists) {
                // Update existing
                const data = doc.data();
                await packRef.update({
                    playedAt: new Date(),
                    timesPlayed: data.timesPlayed + 1,
                    bestScore: Math.max(data.bestScore, score)
                });
                console.log('✅ Updated existing pack in Firebase');
            } else {
                // Create new
                await packRef.set({
                    playedAt: new Date(),
                    timesPlayed: 1,
                    bestScore: score
                });
                console.log('✅ Created new pack in Firebase');
            }

            console.log('Tracked played pack:', packId, 'Score:', score);
        } catch (error) {
            console.error('Error updating played pack:', error);
            throw error; // Let caller handle error
        }
    },

    // Get all played packs for a player
    async getPlayedPacks(playerId) {
        if (!firebaseInitialized) {
            console.log('Demo mode: Would fetch played packs');
            return {};
        }

        try {
            const snapshot = await db.collection('players')
                .doc(playerId)
                .collection('playedPacks')
                .get();

            const playedPacks = {};
            snapshot.forEach(doc => {
                playedPacks[doc.id] = doc.data();
            });

            console.log('Loaded played packs:', Object.keys(playedPacks).length, 'packs');
            return playedPacks;
        } catch (error) {
            console.error('Error getting played packs:', error);
            throw error; // Let caller handle error
        }
    }
};

/**
 * Ensure user is authenticated (anonymous initially, can upgrade later)
 * Returns the user's UID to use as playerId
 * @returns {Promise<string|null>} Firebase Auth UID or null if failed
 */
async function ensureAuthUser() {
    if (!firebaseInitialized) {
        console.log('Firebase not initialized, skipping auth');
        return null;
    }

    return new Promise((resolve) => {
        // Listen for auth state changes
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Already signed in (from previous session)
                console.log('✅ Auth user found:', user.uid, user.isAnonymous ? '(anonymous)' : '(permanent)');

                // Save authProvider to localStorage
                const authProvider = user.isAnonymous ? 'anonymous' :
                    user.providerData?.[0]?.providerId || 'unknown';
                localStorage.setItem('authProvider', authProvider);

                resolve(user.uid);
            } else {
                // Sign in anonymously
                try {
                    const credential = await auth.signInAnonymously();
                    console.log('✅ Anonymous sign-in successful:', credential.user.uid);

                    // Save anonymous authProvider to localStorage
                    localStorage.setItem('authProvider', 'anonymous');

                    resolve(credential.user.uid);
                } catch (error) {
                    console.error('❌ Anonymous sign-in failed:', error);
                    resolve(null);
                }
            }
            unsubscribe(); // Stop listening after first event
        });
    });
}

/**
 * Get current player ID (Firebase Auth UID)
 * Synchronous function - returns current user's UID or null
 * @returns {string|null} Current user's UID or null if not authenticated
 */
function getCurrentPlayerId() {
    if (!firebaseInitialized || !auth) {
        console.warn('Firebase not initialized');
        return null;
    }

    const user = auth.currentUser;
    return user ? user.uid : null;
}

/**
 * Get current auth provider type
 * Returns raw provider ID like "google.com", "password", "anonymous", or "unknown"
 * @returns {string} Provider ID
 */
function getAuthProvider() {
    if (!firebaseInitialized || !auth) {
        return 'unknown';
    }

    const user = auth.currentUser;
    if (!user) {
        return 'unknown';
    }

    if (user.isAnonymous) {
        return 'anonymous';
    }

    if (user.providerData && user.providerData.length > 0) {
        return user.providerData[0].providerId;
    }

    return 'unknown';
}

// Question Rating API
FirebaseAPI.rateQuestion = async function(questionId, playerId, rating) {
    if (!firebaseInitialized) {
        console.log('Demo mode: Would rate question', questionId, rating);
        return { averageRating: rating, totalRatings: 1 };
    }

    if (!questionId || !playerId || rating < 1 || rating > 10) {
        throw new Error('Invalid rating parameters');
    }

    try {
        const ratingRef = db.collection('questionRatings').doc(questionId);
        const doc = await ratingRef.get();

        // Use new Date() instead of serverTimestamp() since it's inside an array
        const timestamp = new Date();
        const newRating = { playerId, rating, timestamp };

        if (doc.exists) {
            const data = doc.data();

            // Check if user already rated (spam protection)
            const existingRating = data.ratings?.find(r => r.playerId === playerId);
            if (existingRating) {
                throw new Error('Du har redan betygsatt denna fråga');
            }

            // Add new rating
            const updatedRatings = [...(data.ratings || []), newRating];
            const totalRatings = updatedRatings.length;
            const sumRatings = updatedRatings.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = sumRatings / totalRatings;

            // Update distribution
            const ratingDistribution = data.ratingDistribution || {};
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;

            await ratingRef.update({
                ratings: updatedRatings,
                averageRating,
                totalRatings,
                ratingDistribution,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { averageRating, totalRatings };
        } else {
            // First rating for this question
            const ratingDistribution = {};
            for (let i = 1; i <= 10; i++) ratingDistribution[i] = 0;
            ratingDistribution[rating] = 1;

            await ratingRef.set({
                ratings: [newRating],
                averageRating: rating,
                totalRatings: 1,
                ratingDistribution,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { averageRating: rating, totalRatings: 1 };
        }
    } catch (error) {
        console.error('Error rating question:', error);
        throw error;
    }
};

FirebaseAPI.hasUserRatedQuestion = async function(questionId, playerId) {
    if (!firebaseInitialized) {
        return { hasRated: false, rating: null };
    }

    try {
        const ratingRef = db.collection('questionRatings').doc(questionId);
        const doc = await ratingRef.get();

        if (!doc.exists) {
            return { hasRated: false, rating: null };
        }

        const data = doc.data();
        const userRating = data.ratings?.find(r => r.playerId === playerId);

        if (userRating) {
            return { hasRated: true, rating: userRating.rating };
        }

        return { hasRated: false, rating: null };
    } catch (error) {
        console.error('Error checking user rating:', error);
        return { hasRated: false, rating: null };
    }
};

FirebaseAPI.getAllQuestionRatings = async function() {
    if (!firebaseInitialized) {
        console.log('Demo mode: No ratings available');
        return [];
    }

    try {
        const snapshot = await db.collection('questionRatings').get();
        const ratings = [];

        snapshot.forEach(doc => {
            ratings.push({
                questionId: doc.id,
                ...doc.data()
            });
        });

        return ratings;
    } catch (error) {
        console.error('Error getting all ratings:', error);
        return [];
    }
};

FirebaseAPI.deleteAllQuestionRatings = async function() {
    if (!firebaseInitialized) {
        console.log('Demo mode: Would delete all ratings');
        return { success: true, deletedCount: 0 };
    }

    try {
        const snapshot = await db.collection('questionRatings').get();
        const batch = db.batch();
        let deleteCount = 0;

        snapshot.forEach(doc => {
            batch.delete(doc.ref);
            deleteCount++;
        });

        await batch.commit();
        console.log(`✅ Deleted ${deleteCount} question ratings`);

        return { success: true, deletedCount: deleteCount };
    } catch (error) {
        console.error('Error deleting all ratings:', error);
        throw error;
    }
};

// Export FirebaseAPI to window for global access
window.FirebaseAPI = FirebaseAPI;

// Export auth helpers for global access
window.ensureAuthUser = ensureAuthUser;
window.getCurrentPlayerId = getCurrentPlayerId;
window.getAuthProvider = getAuthProvider;

// Initialize Firebase when script loads
initializeFirebase();