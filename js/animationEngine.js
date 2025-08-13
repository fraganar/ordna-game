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
    
    // Show point animation when earning a point
    showPointAnimation(sourceElement) {
        if (window.PlayerManager?.isSinglePlayerMode()) {
            this.showFlyingPointToButton(sourceElement);
        } else {
            this.showSimplePointPopup(sourceElement);
        }
    }
    
    // Flying point animation for single player
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
    
    // Simple popup for multiplayer
    showSimplePointPopup(sourceElement) {
        if (!sourceElement) return;
        
        const rect = sourceElement.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = 'point-popup';
        popup.textContent = '+1';
        popup.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top - 10}px;
            font-size: 20px;
            font-weight: bold;
            color: #10b981;
            z-index: 1000;
            pointer-events: none;
            transform: translate(-50%, -100%);
            animation: popupFloat 1s ease-out forwards;
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }
    
    // Show animation when securing points
    showSecureAnimation(points) {
        if (window.PlayerManager?.isSinglePlayerMode()) {
            this.showFlyingPointsToTotal(points);
            this.transformStopButtonToSecured();
        } else {
            this.showSimpleSecureEffect();
        }
    }
    
    // Flying points to total score (single player)
    showFlyingPointsToTotal(points) {
        const stopButton = UI?.get('stopSide');
        if (!stopButton) return;
        
        // Get target element
        const totalScoreElement = UI?.get('activePlayerDisplay');
        if (!totalScoreElement) return;
        
        const sourceRect = stopButton.getBoundingClientRect();
        const targetRect = totalScoreElement.getBoundingClientRect();
        
        // Create multiple flying points
        for (let i = 0; i < Math.min(points, 5); i++) {
            setTimeout(() => {
                const flyingPoint = document.createElement('div');
                flyingPoint.className = 'flying-point-star';
                flyingPoint.textContent = '⭐';
                flyingPoint.style.cssText = `
                    position: fixed;
                    left: ${sourceRect.left + sourceRect.width / 2}px;
                    top: ${sourceRect.top + sourceRect.height / 2}px;
                    font-size: 24px;
                    z-index: 1000;
                    pointer-events: none;
                    transform: translate(-50%, -50%);
                    transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
                `;
                
                document.body.appendChild(flyingPoint);
                
                // Random arc path
                const midX = (sourceRect.left + targetRect.left) / 2 + (Math.random() - 0.5) * 100;
                const midY = Math.min(sourceRect.top, targetRect.top) - 50 - Math.random() * 50;
                
                // First move to arc peak
                setTimeout(() => {
                    flyingPoint.style.left = `${midX}px`;
                    flyingPoint.style.top = `${midY}px`;
                    flyingPoint.style.transform = 'translate(-50%, -50%) scale(1.2)';
                }, 50);
                
                // Then to target
                setTimeout(() => {
                    flyingPoint.style.left = `${targetRect.left + targetRect.width / 2}px`;
                    flyingPoint.style.top = `${targetRect.top + targetRect.height / 2}px`;
                    flyingPoint.style.transform = 'translate(-50%, -50%) scale(0)';
                    flyingPoint.style.opacity = '0';
                }, 500);
                
                // Cleanup
                setTimeout(() => {
                    flyingPoint.remove();
                }, 1500);
            }, i * 100);
        }
        
        // Flash total score after animation
        setTimeout(() => {
            totalScoreElement.classList.add('score-flash');
            setTimeout(() => {
                totalScoreElement.classList.remove('score-flash');
            }, 600);
        }, 1000);
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
    
    // Simple secure effect for multiplayer
    showSimpleSecureEffect() {
        const stopSide = UI?.get('stopSide');
        if (!stopSide) return;
        
        stopSide.classList.add('completed');
        
        // Quick flash effect
        stopSide.style.background = '#10b981';
        stopSide.style.color = 'white';
        
        setTimeout(() => {
            stopSide.style.background = '';
            stopSide.style.color = '';
        }, 300);
    }
    
    // Update stop button points display
    updateStopButtonPoints() {
        const pointsText = document.querySelector('#stop-side .decision-points');
        const currentPlayer = window.PlayerManager?.getCurrentPlayer();
        if (!currentPlayer || !pointsText) return;
        
        const currentPot = currentPlayer.roundPot;
        const stopSide = UI?.get('stopSide');
        
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
            // Disable stop button after animation
            const stopSide = UI?.get('stopSide');
            if (stopSide) {
                setTimeout(() => {
                    stopSide.classList.add('disabled');
                    stopSide.disabled = true;
                }, pointsToLose * 400 + 300);
            }
        } else {
            // Disable immediately if no points
            const stopSide = UI?.get('stopSide');
            if (stopSide) {
                stopSide.classList.add('disabled');
                stopSide.disabled = true;
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