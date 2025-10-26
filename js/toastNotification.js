/**
 * Toast Notification System
 * Simple, non-intrusive notifications for user feedback
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'success', 'error', 'info' (default: 'success')
 * @param {number} duration - Duration in ms before auto-hide (default: 3000)
 */
function showToast(message, type = 'success', duration = 3000) {
    // Remove any existing toast
    const existingToast = document.getElementById('toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'fixed bottom-4 right-4 z-[200] transform transition-all duration-300 ease-out translate-y-0 opacity-0';

    // Style based on type
    let bgColor, textColor, icon;
    if (type === 'success') {
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        icon = '✅';
    } else if (type === 'error') {
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        icon = '❌';
    } else {
        bgColor = 'bg-blue-600';
        textColor = 'text-white';
        icon = 'ℹ️';
    }

    toast.innerHTML = `
        <div class="${bgColor} ${textColor} px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-sm">
            <span class="text-xl">${icon}</span>
            <p class="font-semibold">${message}</p>
        </div>
    `;

    // Add to DOM
    document.body.appendChild(toast);

    // Trigger fade-in animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.remove('opacity-0');
            toast.classList.add('opacity-100');
        });
    });

    // Auto-remove after duration (errors stay longer for readability)
    const displayDuration = type === 'error' ? Math.max(duration, 5000) : duration;

    setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');

        // Remove from DOM after fade-out
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, displayDuration);
}

// Export globally
window.showToast = showToast;
