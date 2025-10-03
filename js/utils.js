// Utility functions for Tres Mangos

/**
 * Detects if a player name is a dummy/placeholder name
 * Dummy names are auto-generated (e.g. "Spelare_12345") and used as internal fallback
 *
 * @param {string} name - The player name to check
 * @returns {boolean} - True if name is dummy/empty, false if real name
 *
 * @example
 * isDummyName("Spelare_12345") // true
 * isDummyName("Anna") // false
 * isDummyName("") // true
 * isDummyName(null) // true
 */
function isDummyName(name) {
    if (!name) return true;
    // Match pattern: Spelare_[digits]
    // Dummy names are OK internally, but should trigger name prompt before public use
    return /^Spelare_\d+$/.test(name);
}

// Export to window for global access
window.isDummyName = isDummyName;
