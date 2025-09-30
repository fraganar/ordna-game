# Test Verification for Step 0

## How to Test

1. **Open the test page:**
   - Navigate to http://localhost:8000/test-step0.html
   - This page provides interactive testing tools

2. **Test Scenarios:**

### Test 1: New User
1. Click "Clear localStorage & Reload"
2. Check console for: "Generated new playerId: player_xxx"
3. Check Firebase Console for new player document
4. Verify only playerId, playerName, selectedPacks remain in localStorage

### Test 2: Existing User (Backwards Compatibility)
1. Click "Setup Old User & Reload"
2. After reload, check:
   - Old challenge_* entries are removed
   - Console shows: "Cleaning up X old localStorage keys"
   - Firebase has player document created

### Test 3: Firebase Sync
1. Click "Check Firebase Player Data"
2. Verify player document exists with:
   - playerId
   - name
   - created timestamp
   - lastSeen timestamp
   - stats object

### Test 4: Offline Mode
1. Open DevTools > Network > Set to Offline
2. Reload the page
3. Game should still work
4. Console shows: "Failed to sync player to Firebase"

### Test 5: Account Recovery (manual test)
1. Copy a playerId from Firebase Console
2. Clear localStorage
3. Enter the playerId in recovery field
4. Click "Recover Account"
5. Account should be restored

## Expected Results

✅ **Success Criteria:**
- New users get unique playerId
- Old users are migrated to Firebase
- localStorage is cleaned of old data
- Game works offline
- Account recovery works with valid playerId

❌ **Known Issues:**
- None at this time

## Console Commands for Manual Testing

```javascript
// Check current state
console.log('PlayerId:', localStorage.getItem('playerId'));
console.log('PlayerName:', localStorage.getItem('playerName'));
console.log('Total keys:', localStorage.length);

// Test Firebase sync
FirebaseAPI.getPlayer(localStorage.getItem('playerId')).then(console.log);

// Force cleanup
window.app.cleanupLocalStorage();
```