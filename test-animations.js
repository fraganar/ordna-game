// Test script for visual effects - paste this in browser console

console.log("Testing Visual Effects...");

// Test 1: Ripple Effect
console.log("1. Testing Ripple Effect...");
const testButton = document.querySelector('#stop-side') || document.querySelector('button');
if (testButton) {
    console.log("   Adding ripple to button:", testButton);
    window.visualEffects.addRippleEffect(testButton);
    console.log("   ✓ Ripple added - click the button to see effect");
} else {
    console.log("   ✗ No button found to test");
}

// Test 2: Particle Explosion
console.log("2. Testing Particle Explosion...");
setTimeout(() => {
    console.log("   Creating particle explosion at center of screen...");
    window.visualEffects.createParticleExplosion(
        window.innerWidth / 2, 
        window.innerHeight / 2, 
        '#22c55e'
    );
    console.log("   ✓ Particles should be visible now!");
}, 1000);

// Test 3: Confetti
console.log("3. Testing Confetti...");
setTimeout(() => {
    console.log("   Triggering confetti...");
    window.visualEffects.triggerConfetti();
    console.log("   ✓ Confetti should be falling now!");
}, 2000);

// Test 4: Check if styles are injected
console.log("4. Checking injected styles...");
const rippleStyles = document.querySelector('#ripple-styles');
const confettiStyles = document.querySelector('#confetti-styles');
console.log("   Ripple styles found:", !!rippleStyles);
console.log("   Confetti styles found:", !!confettiStyles);

// Test 5: Manual particle test
console.log("5. Creating visible test particle...");
const testParticle = document.createElement('div');
testParticle.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    background: red;
    border-radius: 50%;
    z-index: 9999;
    animation: pulse 1s infinite;
`;
document.body.appendChild(testParticle);

// Add pulse animation
if (!document.querySelector('#pulse-test-style')) {
    const pulseStyle = document.createElement('style');
    pulseStyle.id = 'pulse-test-style';
    pulseStyle.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
        }
    `;
    document.head.appendChild(pulseStyle);
}

console.log("   ✓ Red test particle should be pulsing in center of screen");
setTimeout(() => {
    testParticle.remove();
    console.log("   Test particle removed");
}, 5000);

console.log("\n=== Test Complete ===");
console.log("You should have seen:");
console.log("- Particle explosion (green dots)");
console.log("- Confetti falling");
console.log("- Red pulsing test particle");
console.log("Click any button to test ripple effect");