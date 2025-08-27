// Simple test - copy and paste this in console

// Test 1: Red dot that should be visible
(function() {
    const dot = document.createElement('div');
    dot.style.cssText = 'position:fixed;top:50%;left:50%;width:50px;height:50px;background:red;border-radius:50%;z-index:99999;';
    document.body.appendChild(dot);
    console.log('✅ Red dot should be visible in center');
    setTimeout(() => {
        dot.remove();
        console.log('Red dot removed');
    }, 3000);
})();

// Test 2: Particle explosion
setTimeout(() => {
    console.log('Testing particle explosion...');
    window.visualEffects.createParticleExplosion(window.innerWidth/2, window.innerHeight/2, '#00ff00');
}, 1000);

// Test 3: Confetti
setTimeout(() => {
    console.log('Testing confetti...');
    window.visualEffects.triggerConfetti();
}, 2000);

console.log('You should see:');
console.log('1. Red dot NOW');
console.log('2. Green particles in 1 second');
console.log('3. Confetti in 2 seconds');