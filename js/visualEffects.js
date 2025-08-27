// Visual Effects Enhancement for Modern Design
// Adds extra polish and delight to the game experience

(function() {
    'use strict';

    // Particle effect on correct answers
    function createParticleExplosion(x, y, color = '#22c55e') {
        const particleCount = 12;
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = x + 'px';
        container.style.top = y + 'px';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '3000';
        document.body.appendChild(container);

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.backgroundColor = color;
            particle.style.borderRadius = '50%';
            particle.style.boxShadow = `0 0 6px ${color}`;
            
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 50 + Math.random() * 50;
            const duration = 600 + Math.random() * 400;
            
            particle.style.setProperty('--x', Math.cos(angle) * velocity + 'px');
            particle.style.setProperty('--y', Math.sin(angle) * velocity + 'px');
            
            particle.style.animation = `explode ${duration}ms cubic-bezier(0.4, 0, 1, 1) forwards`;
            container.appendChild(particle);
        }

        setTimeout(() => container.remove(), 1000);
    }

    // Ripple effect on button clicks
    function addRippleEffect(button) {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
            ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
            ripple.classList.add('ripple');
            
            // Add ripple styles if not already in CSS
            if (!document.querySelector('#ripple-styles')) {
                const style = document.createElement('style');
                style.id = 'ripple-styles';
                style.textContent = `
                    .ripple {
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.5);
                        transform: scale(0);
                        animation: ripple-animation 0.6s ease-out;
                        pointer-events: none;
                    }
                    @keyframes ripple-animation {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }

    // Confetti celebration for wins
    function triggerConfetti() {
        const colors = ['#d946ef', '#3b82f6', '#22c55e', '#f97316', '#ef4444'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 3 + 's';
                confetti.style.animationDuration = (3 + Math.random() * 2) + 's';
                
                // Add confetti styles if not already in CSS
                if (!document.querySelector('#confetti-styles')) {
                    const style = document.createElement('style');
                    style.id = 'confetti-styles';
                    style.textContent = `
                        .confetti {
                            position: fixed;
                            width: 10px;
                            height: 10px;
                            top: -10px;
                            z-index: 3000;
                            animation: confetti-fall linear forwards;
                        }
                        @keyframes confetti-fall {
                            0% {
                                transform: translateY(0) rotate(0deg);
                                opacity: 1;
                            }
                            100% {
                                transform: translateY(100vh) rotate(720deg);
                                opacity: 0;
                            }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 5000);
            }, i * 50);
        }
    }

    // Smooth number counter animation
    function animateNumber(element, start, end, duration = 1000) {
        const startTime = performance.now();
        const difference = end - start;
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(start + difference * easeOutQuart);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // Hover sound effect (optional - requires audio files)
    function addHoverSound(element, soundUrl) {
        if (!soundUrl) return;
        
        const audio = new Audio(soundUrl);
        audio.volume = 0.1;
        
        element.addEventListener('mouseenter', () => {
            audio.currentTime = 0;
            audio.play().catch(() => {}); // Ignore errors if autoplay is blocked
        });
    }

    // Glow pulse for important elements
    function addGlowPulse(element) {
        element.style.animation = 'glow-pulse 2s ease-in-out infinite';
        
        if (!document.querySelector('#glow-pulse-styles')) {
            const style = document.createElement('style');
            style.id = 'glow-pulse-styles';
            style.textContent = `
                @keyframes glow-pulse {
                    0%, 100% {
                        box-shadow: 0 0 10px rgba(217, 70, 239, 0.3);
                    }
                    50% {
                        box-shadow: 0 0 30px rgba(217, 70, 239, 0.6), 
                                    0 0 60px rgba(217, 70, 239, 0.3);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Export functions for use in game
    window.visualEffects = {
        createParticleExplosion,
        addRippleEffect,
        triggerConfetti,
        animateNumber,
        addHoverSound,
        addGlowPulse
    };

    // Auto-initialize ripple effects on all buttons
    document.addEventListener('DOMContentLoaded', () => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.classList.contains('no-ripple')) {
                addRippleEffect(button);
            }
        });
    });

})();