// Amendes management functions

// Main data array for amendes
let amendes = [];
let amendesCasiers = []; // We'll load this from the API to avoid conflicts

// Initialize amende functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup edit amende modal functionality if it exists
    const editAmendeModal = document.getElementById('editAmendeModal');
    if (editAmendeModal) {
        setupAmendeEventListeners();
    }
    
    // Load casiers and amendes data if we're on the amendes tab
    if (document.getElementById('amendes-content')) {
        fetchCasiers();
        fetchAmendes();
    }
});

// Fetch casiers from API
function fetchCasiers() {
    // Simulate API call for now
    fetch('/api/casiers')
        .then(response => response.json())
        .then(data => {
            amendesCasiers = data;
            populateCasierSelect();
        })
        .catch(error => {
            console.error('Error fetching casiers:', error);
            showNotification('Erreur lors du chargement des casiers', 'error');
        });
}

// Fetch amendes from API
function fetchAmendes() {
    // Simulate API call for now
    fetch('/api/amendes')
        .then(response => response.json())
        .then(data => {
            amendes = data;
            renderAmendesList();
        })
        .catch(error => {
            console.error('Error fetching amendes:', error);
            showNotification('Erreur lors du chargement des amendes', 'error');
        });
}

// Populate casier dropdown
function populateCasierSelect() {
    const casierSelect = document.getElementById('editAmendeCasier');
    if (!casierSelect) return;
    
    let options = '<option value="">Sélectionner un casier</option>';
    amendesCasiers.forEach(casier => {
        options += `<option value="${casier.id}">${casier.code} - ${casier.nom}</option>`;
    });
    
    casierSelect.innerHTML = options;
}

// Setup amende event listeners
function setupAmendeEventListeners() {
    // Close button for modal
    const closeModalBtn = document.getElementById('closeAmendeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            document.getElementById('editAmendeModal').style.display = 'none';
        });
    }
    
    // Save button functionality
    const saveAmendeBtn = document.getElementById('saveAmendeBtn');
    if (saveAmendeBtn) {
        saveAmendeBtn.addEventListener('click', function() {
            saveAmende();
        });
    }
    
    // Handle keyboard events for the modal
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('editAmendeModal');
            if (modal && (modal.style.display === 'flex' || modal.style.display === 'block')) {
                modal.style.display = 'none';
            }
        }
    });
}

// Function to open edit amende modal - make it global for onclick access
window.openEditAmendeModal = function(amendeId = null) {
    const isNew = amendeId === null;
    
    // Set modal title
    document.getElementById('editAmendeId').textContent = isNew ? 'Nouvelle' : amendeId;
    
    // Make sure casiers are loaded
    if (amendesCasiers.length === 0) {
        fetchCasiers();
    }
    
    // Clear form or populate with existing data
    if (isNew) {
        document.getElementById('editAmendeMontant').value = '';
        document.getElementById('editAmendeMotif').value = '';
        document.getElementById('editAmendeLieu').value = '';
        document.getElementById('editAmendeDate').value = new Date().toISOString().split('T')[0]; // Today
        document.getElementById('editAmendeCasier').value = '';
    } else {
        // Find amende by ID
        const amende = amendes.find(a => a.id === amendeId);
        if (amende) {
            document.getElementById('editAmendeMontant').value = amende.montant;
            document.getElementById('editAmendeMotif').value = amende.motif;
            document.getElementById('editAmendeLieu').value = amende.lieu || '';
            document.getElementById('editAmendeDate').value = amende.date_infraction || '';
            document.getElementById('editAmendeCasier').value = amende.casier_id || '';
        }
    }
    
    // Show modal - utiliser style.display pour éviter les erreurs
    const modal = document.getElementById('editAmendeModal');
    modal.style.display = 'flex';
}

// Function to save amende - make it global for onclick access
window.saveAmende = function() {
    const amendeId = document.getElementById('editAmendeId').textContent;
    const isNew = amendeId === 'Nouvelle';
    
    // Get form values
    const montant = parseFloat(document.getElementById('editAmendeMontant').value);
    const motif = document.getElementById('editAmendeMotif').value;
    const lieu = document.getElementById('editAmendeLieu').value;
    const date_infraction = document.getElementById('editAmendeDate').value;
    const casier_id = parseInt(document.getElementById('editAmendeCasier').value) || null;
    
    // Validate required fields
    if (!montant || isNaN(montant)) {
        showNotification('Le montant est obligatoire et doit être un nombre', 'error');
        return;
    }
    
    if (!motif) {
        showNotification('Le motif est obligatoire', 'error');
        return;
    }
    
    // Create amende object
    const amendeData = {
        montant: montant,
        motif: motif,
        lieu: lieu,
        date_infraction: date_infraction,
        casier_id: casier_id
    };
    
    // Send to API
    if (isNew) {
        fetch('/api/amendes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(amendeData)
        })
        .then(response => response.json())
        .then(data => {
            showNotification('Amende créée avec succès', 'success');
            fetchAmendes(); // Refresh the list
            document.getElementById('editAmendeModal').style.display = 'none';
        })
        .catch(error => {
            console.error('Error creating amende:', error);
            showNotification('Erreur lors de la création de l\'amende', 'error');
        });
    } else {
        // Update existing amende
        fetch(`/api/amendes/${amendeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(amendeData)
        })
        .then(response => response.json())
        .then(data => {
            showNotification('Amende mise à jour avec succès', 'success');
            fetchAmendes(); // Refresh the list
            document.getElementById('editAmendeModal').style.display = 'none';
        })
        .catch(error => {
            console.error('Error updating amende:', error);
            showNotification('Erreur lors de la mise à jour de l\'amende', 'error');
        });
    }
}

// Fonction pour supprimer une amende
window.deleteAmende = function(amendeId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette amende ?')) {
        return;
    }
    
    fetch(`/api/amendes/${amendeId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression');
        }
        return response.json();
    })
    .then(data => {
        // Supprimer l'amende de la liste locale
        amendes = amendes.filter(a => a.id !== amendeId);
        
        // Rafraîchir l'affichage
        renderAmendesList();
        
        // Afficher un message de succès
        showNotification('Amende supprimée avec succès', 'success');
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la suppression de l\'amende', 'error');
    });
};

// Function to render amendes list
function renderAmendesList() {
    const amendesList = document.getElementById('amendesList');
    if (!amendesList) return;
    
    if (amendes.length === 0) {
        amendesList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="ri-bill-line text-4xl mb-2"></i>
                <p>Aucune amende trouvée</p>
                <button class="mt-4 px-4 py-2 bg-primary text-white rounded-button text-sm" onclick="openEditAmendeModal()">
                    Créer une amende
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    amendes.forEach(amende => {
        const date = amende.date_infraction ? formatDate(amende.date_infraction) : 'Non spécifiée';
        
        html += `
            <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold">${amende.code} - ${amende.montant} €</h3>
                        <p class="text-sm text-gray-500">Casier: ${amende.casier_nom || 'Non associé'}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="p-2 text-gray-500 hover:text-primary" onclick="openEditAmendeModal(${amende.id})">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="p-2 text-gray-500 hover:text-red-500" onclick="deleteAmende(${amende.id})">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-100">
                    <p class="text-sm text-gray-700">${amende.motif}</p>
                    <div class="flex justify-between mt-2 text-xs text-gray-500">
                        <span>${amende.lieu || 'Lieu non spécifié'}</span>
                        <span>${date}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    amendesList.innerHTML = html;
}