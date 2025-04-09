// Timer functionality
let timerInterval;
let timerRunning = false;
let timerSeconds = 0;
let timerStartTime = null;
let timerPaused = false; // Nouvel état pour savoir si le timer est en pause

// Initialize timer on page load
document.addEventListener('DOMContentLoaded', function() {
    const timerBtn = document.getElementById('timerBtn');
    if (timerBtn) {
        timerBtn.addEventListener('click', handleTimerClick);
    }
    
    // Check if timer was running before page reload
    const savedTimerState = localStorage.getItem('timerState');
    if (savedTimerState) {
        const state = JSON.parse(savedTimerState);
        if (state.running) {
            const elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
            timerSeconds = state.seconds + elapsedTime;
            startTimer();
        } else {
            timerSeconds = state.seconds;
            timerPaused = state.paused || false;
            updateTimerDisplay();
            
            // Réafficher le bouton reset si le timer est en pause
            if (timerPaused) {
                const timerDisplay = document.getElementById('timer');
                if (timerDisplay && !document.getElementById('resetTimerBtn')) {
                    const resetBtn = document.createElement('button');
                    resetBtn.id = 'resetTimerBtn';
                    resetBtn.className = 'ml-2 p-1 text-gray-500 hover:text-red-500 focus:outline-none';
                    resetBtn.innerHTML = '<i class="ri-restart-line"></i>';
                    resetBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        resetTimer();
                        this.remove();
                    });
                    timerDisplay.parentNode.appendChild(resetBtn);
                }
            }
        }
    }
});

// Handle timer button clicks
function handleTimerClick() {
    const timerBtn = document.getElementById('timerBtn');
    const timerIcon = timerBtn.querySelector('i');
    
    // Cas 1: timer en cours -> on le met en pause
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        timerPaused = true;
        timerIcon.classList.remove('ri-pause-fill');
        timerIcon.classList.add('ri-play-fill');
        
        // Format duration
        const hours = Math.floor(timerSeconds / 3600);
        const minutes = Math.floor((timerSeconds % 3600) / 60);
        const seconds = timerSeconds % 60;
        
        const durationFormatted = 
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
        
        // Dispatch event for timer-sessions.js
        document.dispatchEvent(new CustomEvent('timerStopped', {
            detail: {
                startTime: timerStartTime,
                duration: timerSeconds,
                durationFormatted: durationFormatted
            }
        }));
        
        // Save timer state to localStorage
        localStorage.setItem('timerState', JSON.stringify({
            running: false,
            seconds: timerSeconds,
            paused: true,
            startTime: null
        }));
        
        // Add reset button next to the timer
        const timerDisplay = document.getElementById('timer');
        if (timerDisplay && !document.getElementById('resetTimerBtn')) {
            const resetBtn = document.createElement('button');
            resetBtn.id = 'resetTimerBtn';
            resetBtn.className = 'ml-2 p-1 text-gray-500 hover:text-red-500 focus:outline-none';
            resetBtn.innerHTML = '<i class="ri-restart-line"></i>';
            resetBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                resetTimer();
                this.remove();
            });
            timerDisplay.parentNode.appendChild(resetBtn);
        }
        
        // Show stop notification
        showNotification('Chronomètre arrêté - temps sauvegardé', 'info');
    } 
    // Cas 2: timer en pause -> on le relance
    else if (timerPaused) {
        timerPaused = false;
        startTimer();
        timerIcon.classList.remove('ri-play-fill');
        timerIcon.classList.add('ri-pause-fill');
        
        // Remove reset button if exists
        const resetBtn = document.getElementById('resetTimerBtn');
        if (resetBtn) {
            resetBtn.remove();
        }
        
        // Save timer state to localStorage
        localStorage.setItem('timerState', JSON.stringify({
            running: true,
            seconds: timerSeconds,
            paused: false,
            startTime: Date.now()
        }));
        
        // Show start notification
        showNotification('Chronomètre repris', 'success');
    }
    // Cas 3: timer à l'arrêt -> on le démarre
    else {
        // Si on démarre un timer après un reset complet
        startTimer();
        timerIcon.classList.remove('ri-play-fill');
        timerIcon.classList.add('ri-pause-fill');
        
        // Save timer state to localStorage
        localStorage.setItem('timerState', JSON.stringify({
            running: true,
            seconds: timerSeconds,
            paused: false,
            startTime: Date.now()
        }));
        
        // Show start notification
        showNotification('Chronomètre démarré', 'success');
    }
}

// Start the timer
function startTimer() {
    timerRunning = true;
    
    timerStartTime = Date.now() - (timerSeconds * 1000);
    
    timerInterval = setInterval(function() {
        timerSeconds = Math.floor((Date.now() - timerStartTime) / 1000);
        updateTimerDisplay();
    }, 1000);
    
    // Update immediately
    updateTimerDisplay();
}

// Reset the timer
function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerPaused = false;
    timerSeconds = 0;
    updateTimerDisplay();
    
    const timerBtn = document.getElementById('timerBtn');
    const timerIcon = timerBtn.querySelector('i');
    timerIcon.classList.remove('ri-pause-fill');
    timerIcon.classList.add('ri-play-fill');
    
    // Remove reset button if exists
    const resetBtn = document.getElementById('resetTimerBtn');
    if (resetBtn) {
        resetBtn.remove();
    }
    
    // Clear timer state in localStorage
    localStorage.removeItem('timerState');
    
    // Show reset notification
    showNotification('Chronomètre réinitialisé', 'info');
}

// Update the timer display
function updateTimerDisplay() {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    
    const formattedTime = 
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');
    
    document.getElementById('timer').textContent = formattedTime;
}
