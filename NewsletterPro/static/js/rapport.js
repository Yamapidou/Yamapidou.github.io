// Rapports management functions

// Main data array for rapports
let rapports = [];
// We'll use rapportsCasiers to avoid conflict with casiers in amende.js
let rapportsCasiers = []; // We'll load this from the API

// Initialize rapports functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup edit rapport modal functionality if it exists
    const editRapportModal = document.getElementById('editRapportModal');
    if (editRapportModal) {
        setupRapportEventListeners();
    }
    
    // Load casiers and rapports data if we're on the rapports tab
    if (document.getElementById('rapports-content')) {
        fetchCasiers();
        fetchRapports();
    }
});

// Fetch casiers from API
function fetchCasiers() {
    // Real API call
    fetch('/api/casiers')
        .then(response => response.json())
        .then(data => {
            rapportsCasiers = data;
            populateCasierSelect();
        })
        .catch(error => {
            console.error('Error fetching casiers:', error);
            showNotification('Erreur lors du chargement des casiers', 'error');
        });
}

// Fetch rapports from API
function fetchRapports() {
    // Real API call
    fetch('/api/rapports')
        .then(response => response.json())
        .then(data => {
            rapports = data;
            renderRapportsList();
        })
        .catch(error => {
            console.error('Error fetching rapports:', error);
            showNotification('Erreur lors du chargement des rapports', 'error');
        });
}

// Populate casier dropdown
function populateCasierSelect() {
    const casierSelect = document.getElementById('editRapportCasier');
    if (!casierSelect) return;
    
    let options = '<option value="">Sélectionner un casier</option>';
    rapportsCasiers.forEach(casier => {
        options += `<option value="${casier.id}">${casier.code} - ${casier.nom}</option>`;
    });
    
    casierSelect.innerHTML = options;
}

// Setup rapport event listeners
function setupRapportEventListeners() {
    // Close button for modal
    const closeModalBtn = document.getElementById('closeRapportModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            // Utiliser style.display au lieu de classList pour éviter les erreurs
            document.getElementById('editRapportModal').style.display = 'none';
        });
    }
    
    // Save button functionality
    const saveRapportBtn = document.getElementById('saveRapportBtn');
    if (saveRapportBtn) {
        saveRapportBtn.addEventListener('click', function() {
            saveRapport();
        });
    }
    
    // Handle keyboard events for the modal
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('editRapportModal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });
}

// Function to open edit rapport modal - make it global for onclick access
window.openEditRapportModal = function(rapportId = null) {
    const isNew = rapportId === null;
    
    // Set modal title
    document.getElementById('editRapportId').textContent = isNew ? 'Nouveau' : rapportId;
    
    // Make sure casiers are loaded
    if (rapportsCasiers.length === 0) {
        fetchCasiers();
    }
    
    // Clear form or populate with existing data
    if (isNew) {
        document.getElementById('editRapportTitre').value = '';
        document.getElementById('editRapportContenu').value = '';
        document.getElementById('editRapportLieu').value = '';
        document.getElementById('editRapportDate').value = new Date().toISOString().split('T')[0]; // Today
        document.getElementById('editRapportCasier').value = '';
    } else {
        // Find rapport by ID
        const rapport = rapports.find(r => r.id === rapportId);
        if (rapport) {
            document.getElementById('editRapportTitre').value = rapport.titre;
            document.getElementById('editRapportContenu').value = rapport.contenu;
            document.getElementById('editRapportLieu').value = rapport.lieu || '';
            document.getElementById('editRapportDate').value = rapport.date_incident || '';
            document.getElementById('editRapportCasier').value = rapport.casier_id || '';
        }
    }
    
    // Show modal - utiliser flex pour le centrage correct
    const modal = document.getElementById('editRapportModal');
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
}

// Function to save rapport - make it global for onclick access
window.saveRapport = function() {
    const rapportId = document.getElementById('editRapportId').textContent;
    const isNew = rapportId === 'Nouveau';
    
    // Get form values
    const titre = document.getElementById('editRapportTitre').value;
    const contenu = document.getElementById('editRapportContenu').value;
    const lieu = document.getElementById('editRapportLieu').value;
    const date_incident = document.getElementById('editRapportDate').value;
    const casier_id = parseInt(document.getElementById('editRapportCasier').value) || null;
    
    // Validate required fields
    if (!titre) {
        showNotification('Le titre est obligatoire', 'error');
        return;
    }
    
    if (!contenu) {
        showNotification('Le contenu est obligatoire', 'error');
        return;
    }
    
    // Create rapport object
    const rapportData = {
        titre: titre,
        contenu: contenu,
        lieu: lieu,
        date_incident: date_incident,
        casier_id: casier_id
    };
    
    console.log('Sending rapport data:', rapportData);
    
    // Send to API
    if (isNew) {
        fetch('/api/rapports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rapportData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Rapport created successfully:', data);
            showNotification('Rapport créé avec succès', 'success');
            
            // Fermer le modal avant de rafraîchir
            document.getElementById('editRapportModal').style.display = 'none';
            
            // Ajouter directement le nouveau rapport à notre liste
            // Comme le serveur nous renvoie toutes les données, pas besoin de refaire un fetch
            rapports.unshift(data); // Ajouter au début du tableau pour qu'il apparaisse en premier
            
            // Changer de tab pour montrer les rapports
            window.changeTab('rapports');
            
            // Forcer un nouveau rendu de la liste des rapports
            renderRapportsList();
            
            // Mettre en surbrillance le nouveau rapport
            setTimeout(function() {
                const newRapportElement = document.querySelector(`[data-rapport-id="${data.id}"]`);
                if (newRapportElement) {
                    // Utiliser style directement pour éviter les problèmes de classList
                    newRapportElement.style.animation = 'highlightNew 2s ease-in-out';
                    newRapportElement.style.borderLeft = '3px solid #4f46e5';
                    
                    // Retirer la surbrillance après 3 secondes
                    setTimeout(() => {
                        newRapportElement.style.animation = '';
                        newRapportElement.style.borderLeft = '';
                    }, 3000);
                }
            }, 100);
        })
        .catch(error => {
            console.error('Error creating rapport:', error);
            showNotification('Erreur lors de la création du rapport', 'error');
        });
    } else {
        // Update existing rapport
        fetch(`/api/rapports/${rapportId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rapportData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Rapport updated successfully:', data);
            showNotification('Rapport mis à jour avec succès', 'success');
            
            // Fermer le modal avant de rafraîchir
            document.getElementById('editRapportModal').style.display = 'none';
            
            // Mettre à jour directement le rapport dans notre liste
            const index = rapports.findIndex(r => r.id === rapportId);
            if (index !== -1) {
                rapports[index] = data;
            }
            
            // Forcer un nouveau rendu de la liste des rapports
            renderRapportsList();
            
            // Mettre en surbrillance le rapport mis à jour
            setTimeout(function() {
                const updatedRapportElement = document.querySelector(`[data-rapport-id="${data.id}"]`);
                if (updatedRapportElement) {
                    updatedRapportElement.style.animation = 'highlightNew 2s ease-in-out';
                    updatedRapportElement.style.borderLeft = '3px solid #4f46e5';
                    
                    // Retirer la surbrillance après 3 secondes
                    setTimeout(() => {
                        updatedRapportElement.style.animation = '';
                        updatedRapportElement.style.borderLeft = '';
                    }, 3000);
                }
            }, 100);
        })
        .catch(error => {
            console.error('Error updating rapport:', error);
            showNotification('Erreur lors de la mise à jour du rapport', 'error');
        });
    }
}

// Fonction pour supprimer un rapport
window.deleteRapport = function(rapportId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
        return;
    }
    
    fetch(`/api/rapports/${rapportId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression');
        }
        return response.json();
    })
    .then(data => {
        // Supprimer le rapport de la liste locale
        rapports = rapports.filter(r => r.id !== rapportId);
        
        // Rafraîchir l'affichage
        renderRapportsList();
        
        // Afficher un message de succès
        showNotification('Rapport supprimé avec succès', 'success');
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la suppression du rapport', 'error');
    });
};

// Function to render rapports list
function renderRapportsList() {
    const rapportsList = document.getElementById('rapportsList');
    if (!rapportsList) return;
    
    if (rapports.length === 0) {
        rapportsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="ri-file-text-line text-4xl mb-2"></i>
                <p>Aucun rapport trouvé</p>
                <button class="mt-4 px-4 py-2 bg-primary text-white rounded-button text-sm" onclick="openEditRapportModal()">
                    Créer un rapport
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    rapports.forEach(rapport => {
        const date = rapport.date_incident ? formatDate(rapport.date_incident) : 'Non spécifiée';
        
        html += `
            <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all" data-rapport-id="${rapport.id}">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold">${rapport.code} - ${rapport.titre}</h3>
                        <p class="text-sm text-gray-500">Casier: ${rapport.casier_nom || 'Non associé'}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="p-2 text-gray-500 hover:text-primary" onclick="openEditRapportModal(${rapport.id})">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="p-2 text-gray-500 hover:text-red-500" onclick="deleteRapport(${rapport.id})">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-100">
                    <p class="text-sm text-gray-700">${rapport.contenu.substring(0, 150)}${rapport.contenu.length > 150 ? '...' : ''}</p>
                    <div class="flex justify-between mt-2 text-xs text-gray-500">
                        <span>${rapport.lieu || 'Lieu non spécifié'}</span>
                        <span>${date}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    rapportsList.innerHTML = html;
}