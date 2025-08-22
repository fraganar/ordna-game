// Animation Engine Module - Handles all visual animations and effects

class AnimationEngine {
    constructor() {
        this.animationSpeed = 300; // Base animation speed in ms
    }
    
    // Wake up the stop button when first point is earned
    wakeUpStopButton() {
        const decisionButton = UI?.get('decisionButton');
        if (!decisionButton) return;
        
        decisionButton.classList.remove('inactive');
        decisionButton.classList.add('awakening');
        
        // Wake up animation with glow
        setTimeout(() => {
            decisionButton.classList.remove('awakening');
        }, 1500);
    }
    
    // Show point animation when earning a point - unified for all game modes
    showPointAnimation(sourceElement) {
        // Always show the flying point animation, regardless of game mode
        this.showFlyingPointToButton(sourceElement);
    }
    
    // Flying point animation for all game modes (unified)
    showFlyingPointToButton(sourceElement) {
        if (!sourceElement) return;
        
        // Get positions
        const sourceRect = sourceElement.getBoundingClientRect();
        const stopSide = UI?.get('stopSide');
        if (!stopSide) return;
        const targetRect = stopSide.getBoundingClientRect();
        
        // Create flying point element
        const flyingPoint = document.createElement('div');
        flyingPoint.className = 'flying-point';
        flyingPoint.textContent = '+1';
        flyingPoint.style.cssText = `
            position: fixed;
            left: ${sourceRect.left + sourceRect.width / 2}px;
            top: ${sourceRect.top + sourceRect.height / 2}px;
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
            z-index: 1000;
            pointer-events: none;
            transform: translate(-50%, -50%);
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        document.body.appendChild(flyingPoint);
        
        // Initial pop effect
        requestAnimationFrame(() => {
            flyingPoint.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        
        // Fly to target after brief delay
        setTimeout(() => {
            flyingPoint.style.left = `${targetRect.left + targetRect.width / 2}px`;
            flyingPoint.style.top = `${targetRect.top + targetRect.height / 2}px`;
            flyingPoint.style.transform = 'translate(-50%, -50%) scale(0.8)';
            flyingPoint.style.opacity = '0.8';
        }, 100);
        
        // Landing effect and cleanup
        setTimeout(() => {
            flyingPoint.style.transform = 'translate(-50%, -50%) scale(0)';
            flyingPoint.style.opacity = '0';
            
            setTimeout(() => {
                flyingPoint.remove();
                
                // Add landing effect
                const decisionButton = UI?.get('decisionButton');
                if (decisionButton) {
                    decisionButton.classList.add('point-landing');
                    setTimeout(() => {
                        decisionButton.classList.remove('point-landing');
                    }, 600);
                }
                
                // Update button text
                this.updateStopButtonPoints();
            }, 200);
        }, 800);
    }
    
    
    // Show animation when securing points - UNIFIED for all game modes (like original design)
    showSecureAnimation(points) {
        // Always show full animations regardless of game mode - this matches the original design
        this.showFlyingPointsToTotal(points);
        this.transformStopButtonToSecured();
    }
    
    // Flying points to total score - UNIFIED for all game modes (restored original design)
    showFlyingPointsToTotal(points) {
        const stopButton = UI?.get('stopSide');
        if (!stopButton) return;
        
        // Get target element - smart selection like original (single vs multiplayer)
        const totalScoreElement = window.PlayerManager?.isSinglePlayerMode() ? 
            UI?.get('activePlayerDisplay') : // Single player target
            UI?.get('miniScores'); // Multiplayer target
        
        // Fallback if target not found
        if (!totalScoreElement) {
            console.error('Target element for flying points not found');
            return;
        }
        
        const sourceRect = stopButton.getBoundingClientRect();
        const targetRect = totalScoreElement.getBoundingClientRect();
        
        // Create flying point element (like original)
        const flyingPoint = document.createElement('div');
        flyingPoint.className = 'flying-point-to-total';
        flyingPoint.textContent = `+${points}`;
        flyingPoint.style.cssText = `
            position: fixed;
            left: ${sourceRect.left + sourceRect.width / 2}px;
            top: ${sourceRect.top + sourceRect.height / 2}px;
            font-size: 24px;
            font-weight: bold;
            color: #15803d;
            z-index: 1000;
            pointer-events: none;
            transform: translate(-50%, -50%);
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(flyingPoint);
        
        // Animate with cubic bezier curve (like original)
        const startX = sourceRect.left + sourceRect.width / 2;
        const startY = sourceRect.top + sourceRect.height / 2;
        const endX = targetRect.left + targetRect.width / 2;
        const endY = targetRect.top + targetRect.height / 2;
        
        const controlX1 = startX + (endX - startX) * 0.2;
        const controlY1 = startY - 100; // Arc upward
        const controlX2 = startX + (endX - startX) * 0.8;
        const controlY2 = startY - 120;
        
        let startTime = null;
        const duration = 800;
        
        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Cubic bezier curve calculation
            const t = progress;
            const x = Math.pow(1-t, 3) * startX + 
                      3 * Math.pow(1-t, 2) * t * controlX1 + 
                      3 * (1-t) * Math.pow(t, 2) * controlX2 + 
                      Math.pow(t, 3) * endX;
            const y = Math.pow(1-t, 3) * startY + 
                      3 * Math.pow(1-t, 2) * t * controlY1 + 
                      3 * (1-t) * Math.pow(t, 2) * controlY2 + 
                      Math.pow(t, 3) * endY;
            
            flyingPoint.style.left = x + 'px';
            flyingPoint.style.top = y + 'px';
            
            // Fade and scale during last 20% of animation
            if (progress > 0.8) {
                const fadeProgress = (progress - 0.8) / 0.2;
                flyingPoint.style.opacity = 1 - fadeProgress;
                flyingPoint.style.transform = `translate(-50%, -50%) scale(${1 + fadeProgress * 0.5})`;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete - add glow effect to total score
                totalScoreElement.style.transition = 'all 0.3s ease';
                totalScoreElement.style.boxShadow = '0 0 20px rgba(21, 128, 61, 0.5)';
                setTimeout(() => {
                    totalScoreElement.style.boxShadow = '';
                }, 600);
                
                // Remove flying point
                flyingPoint.remove();
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Transform stop button to "Secured" state
    transformStopButtonToSecured() {
        const stopSide = UI?.get('stopSide');
        if (!stopSide) return;
        
        const stopIcon = stopSide.querySelector('.decision-icon');
        const stopAction = stopSide.querySelector('.decision-action');
        const stopPoints = stopSide.querySelector('.decision-points');
        
        // Transform animation
        stopSide.style.transition = 'all 0.3s ease';
        stopSide.classList.add('securing');
        
        setTimeout(() => {
            if (stopIcon) stopIcon.textContent = '✅';
            if (stopAction) stopAction.textContent = 'Säkrat!';
            if (stopPoints) stopPoints.style.opacity = '0';
            
            stopSide.classList.remove('securing');
            stopSide.classList.add('completed');
        }, 300);
    }
    
    
    // Update stop button points display
    updateStopButtonPoints() {
        const pointsText = document.querySelector('#stop-side .decision-points');
        const currentPlayer = window.PlayerManager?.getCurrentPlayer();
        
        if (!currentPlayer || !pointsText) return;
        
        const currentPot = currentPlayer.roundPot;
        const stopSide = UI?.get('stopSide');
        
        // Reset any animation styles that might hide the text
        pointsText.style.opacity = '1';
        pointsText.style.transform = '';
        pointsText.style.transition = '';
        
        if (window.PlayerManager?.isSinglePlayerMode()) {
            pointsText.textContent = `+${currentPot} poäng`;
        } else {
            pointsText.textContent = `${currentPlayer.name} +${currentPot}p`;
        }
        
        if (stopSide) {
            if (currentPot > 0) {
                stopSide.classList.add('has-points');
            } else {
                stopSide.classList.remove('has-points');
            }
        }
    }
    
    // Animate points draining on mistake
    animatePointsDrain(currentPoints) {
        if (currentPoints <= 0) return;
        
        const pointsElement = document.querySelector('#stop-side .decision-points');
        const stopButton = UI?.get('stopSide');
        const currentPlayer = window.PlayerManager?.getCurrentPlayer();
        
        if (!pointsElement || !currentPlayer) return;
        
        // Add shake and dark pulse effects
        if (stopButton) {
            stopButton.classList.add('button-shake', 'button-dark-pulse');
        }
        
        let remainingPoints = currentPoints;
        const drainInterval = setInterval(() => {
            remainingPoints--;
            
            // Update display
            if (window.PlayerManager?.isSinglePlayerMode()) {
                pointsElement.textContent = `+${remainingPoints} poäng`;
            } else {
                pointsElement.textContent = `${currentPlayer.name} +${remainingPoints}p`;
            }
            
            // Create falling point effect
            const fallingPoint = document.createElement('div');
            fallingPoint.className = 'falling-point';
            fallingPoint.textContent = '-1';
            fallingPoint.style.cssText = `
                position: fixed;
                left: ${stopButton.getBoundingClientRect().left + stopButton.getBoundingClientRect().width / 2}px;
                top: ${stopButton.getBoundingClientRect().top + stopButton.getBoundingClientRect().height / 2}px;
                color: #ef4444;
                font-size: 20px;
                font-weight: bold;
                z-index: 1000;
                pointer-events: none;
                transform: translate(-50%, -50%);
                animation: fallDown 1s ease-in forwards;
            `;
            
            document.body.appendChild(fallingPoint);
            
            setTimeout(() => {
                fallingPoint.remove();
            }, 1000);
            
            if (remainingPoints <= 0) {
                clearInterval(drainInterval);
                // Remove effects after animation
                setTimeout(() => {
                    if (stopButton) {
                        stopButton.classList.remove('button-shake', 'button-dark-pulse');
                    }
                }, 1500);
            }
        }, 400);
    }
    
    // Enable next button after mistake
    enableNextButtonAfterMistake(pointsToLose = 0) {
        // Drain points if any
        if (pointsToLose > 0) {
            this.animatePointsDrain(pointsToLose);
            // CRITICAL FIX for BL-002: Don't disable stop button in multiplayer!
            // The button state will be managed by updateGameControls() after player turn change
            if (window.PlayerManager && window.PlayerManager.isSinglePlayerMode()) {
                const stopSide = UI?.get('stopSide');
                if (stopSide) {
                    setTimeout(() => {
                        stopSide.classList.add('disabled');
                        stopSide.disabled = true;
                    }, pointsToLose * 400 + 300);
                }
            }
        } else {
            // CRITICAL FIX for BL-002: Only disable immediately if single player
            if (window.PlayerManager && window.PlayerManager.isSinglePlayerMode()) {
                const stopSide = UI?.get('stopSide');
                if (stopSide) {
                    stopSide.classList.add('disabled');
                    stopSide.disabled = true;
                }
            }
        }
    }
    
    // Reset decision buttons for new question
    resetDecisionButtons() {
        const stopSide = UI?.get('stopSide');
        const nextSide = UI?.get('nextSide');
        const decisionButton = UI?.get('decisionButton');
        
        if (stopSide) {
            stopSide.classList.remove('disabled', 'has-points', 'completed');
            stopSide.disabled = false;
            stopSide.dataset.processing = 'false';
            
            // Restore original content
            const stopIcon = stopSide.querySelector('.decision-icon');
            const stopAction = stopSide.querySelector('.decision-action');
            if (stopIcon) stopIcon.textContent = '🛡️';
            if (stopAction) stopAction.textContent = 'Stanna';
        }
        
        if (nextSide) {
            nextSide.disabled = true;
        }
        
        if (decisionButton) {
            decisionButton.classList.add('inactive');
        }
        
        // Reset points display
        this.updateStopButtonPoints();
    }
    
    // Trigger attention animation on decision button
    triggerDecisionButtonAnimation() {
        const decisionButton = UI?.get('decisionButton');
        if (!decisionButton) return;
        
        // Remove and re-add animation class to restart
        decisionButton.classList.remove('attention');
        
        setTimeout(() => {
            decisionButton.classList.add('attention');
        }, 10);
        
        // Remove after animation completes
        setTimeout(() => {
            decisionButton.classList.remove('attention');
        }, 2400);
    }
}

// Create global instance and make methods accessible
const animationEngineInstance = new AnimationEngine();

// Copy methods to the instance to make them accessible
Object.getOwnPropertyNames(AnimationEngine.prototype).forEach(name => {
    if (name !== 'constructor' && typeof AnimationEngine.prototype[name] === 'function') {
        animationEngineInstance[name] = AnimationEngine.prototype[name].bind(animationEngineInstance);
    }
});

window.AnimationEngine = animationEngineInstance;

// Add necessary CSS animations if not present
const style = document.createElement('style');
style.textContent = `
    @keyframes popupFloat {
        0% {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -200%) scale(1.5);
        }
    }
    
    @keyframes fallDown {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, 100px);
        }
    }
    
    .score-flash {
        animation: flash 0.6s ease;
    }
    
    @keyframes flash {
        0%, 100% {
            background-color: transparent;
        }
        50% {
            background-color: rgba(16, 185, 129, 0.2);
        }
    }
    
    .turn-transition {
        animation: slideHighlight 0.3s ease;
    }
    
    @keyframes slideHighlight {
        0% {
            transform: translateX(-10px);
            opacity: 0.7;
        }
        100% {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);