// Variables globales pour stocker les sessions
let timerSessions = [];

// Fetch de la liste des sessions
function fetchTimerSessions() {
    fetch('/api/timer-sessions')
        .then(response => response.json())
        .then(data => {
            timerSessions = data;
            renderTimerSessionsList();
        })
        .catch(error => {
            console.error('Error fetching timer sessions:', error);
            showNotification('Erreur lors du chargement des sessions', 'error');
        });
}

// Function to format duration from seconds
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Function to render timer sessions list
function renderTimerSessionsList() {
    const sessionsList = document.getElementById('timerSessionsList');
    if (!sessionsList) return;
    
    if (timerSessions.length === 0) {
        sessionsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="ri-time-line text-4xl mb-2"></i>
                <p>Aucune session enregistrée</p>
                <p class="text-sm mt-2">Utilisez le chronomètre en haut de la page pour enregistrer vos sessions de temps</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    timerSessions.forEach(session => {
        const formattedDate = formatDate(session.date);
        
        html += `
            <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold">${session.code}</h3>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="p-2 text-gray-500 hover:text-red-500" onclick="deleteTimerSession(${session.id})">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-100">
                    <div class="flex items-center justify-between mb-2">
                        <div class="text-sm text-gray-700">
                            <span class="font-medium">Date:</span> ${formattedDate}
                        </div>
                        <div class="text-sm text-gray-700">
                            <span class="font-medium">Heure:</span> ${session.heure_debut}
                        </div>
                    </div>
                    <div class="flex justify-between mt-2 items-center">
                        <span class="text-lg font-bold text-primary">${session.duree_formatee}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    sessionsList.innerHTML = html;
}

// Fonction pour supprimer une session
window.deleteTimerSession = function(sessionId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
        return;
    }
    
    fetch(`/api/timer-sessions/${sessionId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression');
        }
        return response.json();
    })
    .then(data => {
        // Supprimer la session de la liste locale
        timerSessions = timerSessions.filter(s => s.id !== sessionId);
        
        // Rafraîchir l'affichage
        renderTimerSessionsList();
        
        // Afficher un message de succès
        showNotification('Session supprimée avec succès', 'success');
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la suppression de la session', 'error');
    });
};

// When the Temps tab is activated
document.addEventListener('tabChanged', function(e) {
    if (e.detail.tab === 'temps') {
        fetchTimerSessions();
    }
});

// Listen for timer stops
document.addEventListener('timerStopped', function(e) {
    const { startTime, duration, durationFormatted } = e.detail;
    
    // Format start time for API
    const startDate = new Date(startTime);
    const hours = String(startDate.getHours()).padStart(2, '0');
    const minutes = String(startDate.getMinutes()).padStart(2, '0');
    const formattedStartTime = `${hours}:${minutes}`;
    
    // Send to API
    fetch('/api/timer-sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            heure_debut: formattedStartTime,
            duree_secondes: duration,
            duree_formatee: durationFormatted
        })
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Session de chronomètre enregistrée', 'success');
        
        // Rafraîchir les sessions si on est dans l'onglet temps
        if (document.getElementById('temps-tab').classList.contains('tab-active')) {
            fetchTimerSessions();
        }
    })
    .catch(error => {
        console.error('Error creating timer session:', error);
        showNotification('Erreur lors de l\'enregistrement de la session', 'error');
    });
});