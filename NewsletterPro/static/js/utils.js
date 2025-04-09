// Utility functions for notifications and common tasks

// Function to show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => {
        notif.classList.add('notification-exit');
        setTimeout(() => {
            if (notif.parentNode) {
                notif.parentNode.removeChild(notif);
            }
        }, 300);
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', 'fixed', 'top-4', 'right-4', 'bg-white', 
                               'rounded-lg', 'shadow-lg', 'p-4', 'max-w-sm', 'z-50', 
                               'notification-enter', 'flex', 'items-start', 'gap-3');
    
    // Set icon and color based on type
    let iconClass, bgClasses;
    switch (type) {
        case 'success':
            iconClass = 'ri-check-line text-green-500';
            bgClasses = ['bg-green-50', 'border-l-4', 'border-green-500'];
            break;
        case 'error':
            iconClass = 'ri-error-warning-line text-red-500';
            bgClasses = ['bg-red-50', 'border-l-4', 'border-red-500'];
            break;
        case 'warning':
            iconClass = 'ri-alert-line text-amber-500';
            bgClasses = ['bg-amber-50', 'border-l-4', 'border-amber-500'];
            break;
        default:
            iconClass = 'ri-information-line text-blue-500';
            bgClasses = ['bg-blue-50', 'border-l-4', 'border-blue-500'];
    }
    
    // Ajouter les classes individuellement pour éviter les problèmes d'espace
    bgClasses.forEach(cls => {
        notification.classList.add(cls);
    });
    
    // Add content
    notification.innerHTML = `
        <div class="text-xl">
            <i class="${iconClass}"></i>
        </div>
        <div class="flex-1">
            <p class="text-gray-700">${message}</p>
        </div>
        <button class="text-gray-400 hover:text-gray-600 ml-2" onclick="this.parentNode.remove()">
            <i class="ri-close-line"></i>
        </button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('notification-exit');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Function to format date
function formatDate(dateString) {
    if (!dateString) return 'Non spécifié';
    
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}
