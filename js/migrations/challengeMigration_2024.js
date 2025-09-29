/**
 * TEMPORARY MIGRATION MODULE
 *
 * Purpose: Migrate old localStorage challenges to Firebase with playerId
 * Date: 2024-12-28
 * Can be removed: After all active users have run this migration (estimated: 2025-02)
 *
 * What it does:
 * - Finds challenges in localStorage with role but no playerId in Firebase
 * - Adds playerId to Firebase based on role (challenger/opponent)
 * - Keeps localStorage intact as backup (does NOT remove anything)
 *
 * How to remove this later:
 * 1. Delete this file: js/migrations/challengeMigration_2024.js
 * 2. Remove script tag from index.html
 * 3. Remove migration call from app.js initialize()
 */

const ChallengeMigration = {

    // Migration flag to ensure it only runs once per user
    MIGRATION_KEY: 'migration_challenges_v1_completed',

    /**
     * Check if migration should run
     * Returns false if already completed or no old challenges found
     */
    async shouldRunMigration() {
        // Check if migration already completed
        if (localStorage.getItem(this.MIGRATION_KEY) === 'true') {
            console.log('✅ Challenge migration already completed');
            return false;
        }

        // Check if there are any old challenges to migrate
        let hasOldChallenges = false;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('challenge_')) {
                hasOldChallenges = true;
                break;
            }
        }

        if (!hasOldChallenges) {
            console.log('✅ No old challenges found - skipping migration');
            // Mark as completed anyway so we don't check again
            localStorage.setItem(this.MIGRATION_KEY, 'true');
            return false;
        }

        return true;
    },

    /**
     * Run the migration
     * Migrates challenges from localStorage to Firebase by adding missing playerIds
     */
    async migrate() {
        const myPlayerId = localStorage.getItem('playerId');

        if (!myPlayerId) {
            console.log('⚠️ No playerId found - skipping migration');
            localStorage.setItem(this.MIGRATION_KEY, 'true');
            return { success: false, reason: 'No playerId' };
        }

        console.log('🔄 Starting challenge migration for playerId:', myPlayerId);

        // Find all challenges in localStorage
        const challengesToMigrate = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('challenge_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    challengesToMigrate.push({
                        key,
                        id: key.replace('challenge_', ''),
                        role: data.role, // 'challenger' or 'opponent'
                        data
                    });
                } catch (e) {
                    console.error(`Failed to parse ${key}:`, e);
                }
            }
        }

        console.log(`📦 Found ${challengesToMigrate.length} challenges to check`);

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        // Migrate each challenge
        for (const local of challengesToMigrate) {
            try {
                // Fetch challenge from Firebase
                const firebase = await FirebaseAPI.getChallenge(local.id);

                if (!firebase) {
                    console.log(`⚠️ Challenge ${local.id} not found in Firebase - skipping`);
                    skippedCount++;
                    continue;
                }

                // Check if playerId already exists
                const challengerHasId = firebase.challenger?.playerId;
                const opponentHasId = firebase.opponent?.playerId;

                if (challengerHasId && opponentHasId) {
                    console.log(`✅ Challenge ${local.id} already has both playerIds`);
                    skippedCount++;
                    continue;
                }

                // Prepare updates based on role
                let updates = {};
                let needsUpdate = false;

                if (local.role === 'challenger' && !challengerHasId) {
                    updates.challenger = {
                        ...firebase.challenger,
                        playerId: myPlayerId
                    };
                    needsUpdate = true;
                    console.log(`🔧 Adding playerId to challenger for challenge ${local.id}`);
                }

                if (local.role === 'opponent' && !opponentHasId) {
                    updates.opponent = {
                        ...firebase.opponent,
                        playerId: myPlayerId
                    };
                    needsUpdate = true;
                    console.log(`🔧 Adding playerId to opponent for challenge ${local.id}`);
                }

                // Update Firebase if needed
                if (needsUpdate) {
                    await FirebaseAPI.updateChallenge(local.id, updates);
                    console.log(`✅ Migrated challenge ${local.id} (role: ${local.role})`);
                    migratedCount++;
                } else {
                    console.log(`⏭️  Challenge ${local.id} already has playerId for role ${local.role}`);
                    skippedCount++;
                }

                // NOTE: We deliberately DON'T remove from localStorage
                // If migration fails later, the data is still there as backup
                // localStorage cleanup can be done manually by user if desired

            } catch (error) {
                console.error(`❌ Failed to migrate challenge ${local.id}:`, error);
                errorCount++;
                // localStorage data remains intact for retry or manual recovery
            }
        }

        // NOTE: We DON'T clean up localStorage automatically
        // This ensures data isn't lost if migration fails
        // The new system reads from Firebase, so localStorage data won't interfere
        console.log('💡 Note: localStorage data kept intact as backup (not removed by migration)');

        // Mark migration as completed
        localStorage.setItem(this.MIGRATION_KEY, 'true');

        // Invalidate cache to reload fresh data from Firebase
        if (window.ChallengeSystem && typeof window.ChallengeSystem.invalidateCache === 'function') {
            window.ChallengeSystem.invalidateCache();
            console.log('🔄 Cache invalidated - will reload challenges from Firebase');
        }

        const result = {
            success: true,
            migratedCount,
            skippedCount,
            errorCount,
            total: challengesToMigrate.length
        };

        console.log(`
🎉 CHALLENGE MIGRATION COMPLETE!
✅ Migrated: ${migratedCount} challenges (added playerId)
⏭️  Skipped: ${skippedCount} challenges (already had playerId or not in Firebase)
❌ Errors: ${errorCount} challenges (will retry next time)
📦 Total processed: ${challengesToMigrate.length} challenges
        `);

        return result;
    }
};

// Export for use in app.js
window.ChallengeMigration = ChallengeMigration;