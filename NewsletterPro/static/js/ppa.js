// Variables globales pour stocker les PPAs et casiers
let ppas = [];
let ppaCasiers = [];

// Variable de contrôle pour éviter les soumissions multiples
let isSavingPPA = false;

// Fetch de la liste des PPA
function fetchPPAs() {
    fetch('/api/ppas')
        .then(response => response.json())
        .then(data => {
            ppas = data;
            renderPPAsList();
        })
        .catch(error => {
            console.error('Error fetching PPAs:', error);
            showNotification('Erreur lors du chargement des PPAs', 'error');
        });
}

// Fetch de la liste des casiers pour le formulaire
function fetchCasiers() {
    fetch('/api/casiers')
        .then(response => response.json())
        .then(data => {
            ppaCasiers = data;
            populateCasierSelect();
        })
        .catch(error => {
            console.error('Error fetching casiers for PPA:', error);
        });
}

// Populate casier dropdown
function populateCasierSelect() {
    const casierSelect = document.getElementById('editPPACasier');
    if (!casierSelect) return;
    
    let options = '<option value="">Sélectionner un casier</option>';
    ppaCasiers.forEach(casier => {
        options += `<option value="${casier.id}">${casier.code} - ${casier.nom}</option>`;
    });
    
    casierSelect.innerHTML = options;
}

// Fonction de gestion du clic sur le bouton de fermeture
function closeModalHandler() {
    document.getElementById('editPPAModal').style.display = 'none';
    // Réinitialiser la variable de contrôle
    isSavingPPA = false;
}

// Fonction de gestion du clic sur le bouton de sauvegarde
function savePPAHandler() {
    savePPA();
}

// Setup PPA event listeners
function setupPPAEventListeners() {
    // Close button for modal
    const closeModalBtn = document.getElementById('closePPAModalBtn');
    if (closeModalBtn) {
        // Enlever les gestionnaires d'événements précédents pour éviter les doublons
        closeModalBtn.removeEventListener('click', closeModalHandler);
        closeModalBtn.addEventListener('click', closeModalHandler);
    }
    
    // Save button functionality
    const savePPABtn = document.getElementById('savePPABtn');
    if (savePPABtn) {
        // Enlever les gestionnaires d'événements précédents pour éviter les doublons
        savePPABtn.removeEventListener('click', savePPAHandler);
        savePPABtn.addEventListener('click', savePPAHandler);
    }
    
    // Setup test psychologique buttons
    const testStatusButtons = document.querySelectorAll('.test-status');
    testStatusButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            testStatusButtons.forEach(btn => {
                btn.classList.remove('bg-primary', 'text-white');
                btn.classList.add('border-gray-300', 'text-gray-700');
            });
            
            // Add active class to clicked button
            this.classList.remove('border-gray-300', 'text-gray-700');
            this.classList.add('bg-primary', 'text-white');
            
            // Update hidden input
            document.getElementById('editPPATestPsy').value = this.dataset.status;
        });
    });
    
    // Handle keyboard events for the modal
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('editPPAModal');
            if (modal && (modal.style.display === 'flex' || modal.style.display === 'block')) {
                modal.style.display = 'none';
            }
        }
    });
}

// Function to open edit PPA modal - make it global for onclick access
window.openEditPPAModal = function(ppaId = null) {
    const isNew = ppaId === null;
    
    // Set modal title
    document.getElementById('editPPAId').textContent = isNew ? 'Nouveau' : ppaId;
    
    // Make sure casiers are loaded
    if (ppaCasiers.length === 0) {
        fetchCasiers();
    }
    
    // Set current time in the heure field
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // Clear form or populate with existing data
    if (isNew) {
        document.getElementById('editPPAPersonne').value = '';
        document.getElementById('editPPAHeure').value = `${hours}:${minutes}`;
        document.getElementById('editPPAMatricule').value = '';
        document.getElementById('editPPAModeleArme').value = '';
        document.getElementById('editPPAMunitions').value = '';
        document.getElementById('editPPACasier').value = '';
        document.getElementById('editPPATestPsy').value = 'attente';
        document.getElementById('editPPADateTestPsy').value = new Date().toISOString().split('T')[0]; // Aujourd'hui
        
        // Set the "En attente" button as active
        const testStatusButtons = document.querySelectorAll('.test-status');
        testStatusButtons.forEach(btn => {
            if (btn.dataset.status === 'attente') {
                btn.classList.remove('border-gray-300', 'text-gray-700');
                btn.classList.add('bg-primary', 'text-white');
            } else {
                btn.classList.remove('bg-primary', 'text-white');
                btn.classList.add('border-gray-300', 'text-gray-700');
            }
        });
    } else {
        // Find PPA by ID
        const ppa = ppas.find(p => p.id === ppaId);
        if (ppa) {
            document.getElementById('editPPAPersonne').value = ppa.personne_concernee || '';
            document.getElementById('editPPAHeure').value = ppa.heure || `${hours}:${minutes}`;
            document.getElementById('editPPAMatricule').value = ppa.matricule_agent || '';
            document.getElementById('editPPAModeleArme').value = ppa.modele_arme || '';
            document.getElementById('editPPAMunitions').value = ppa.nombre_munitions || '';
            document.getElementById('editPPACasier').value = ppa.casier_id || '';
            document.getElementById('editPPATestPsy').value = ppa.test_psychologique || 'attente';
            document.getElementById('editPPADateTestPsy').value = ppa.date_test_psy || new Date().toISOString().split('T')[0];
            
            // Set the correct test button as active
            const testStatusButtons = document.querySelectorAll('.test-status');
            testStatusButtons.forEach(btn => {
                if (btn.dataset.status === ppa.test_psychologique) {
                    btn.classList.remove('border-gray-300', 'text-gray-700');
                    btn.classList.add('bg-primary', 'text-white');
                } else {
                    btn.classList.remove('bg-primary', 'text-white');
                    btn.classList.add('border-gray-300', 'text-gray-700');
                }
            });
        }
    }
    
    // Show modal - utiliser style.display pour éviter les erreurs
    const modal = document.getElementById('editPPAModal');
    modal.style.display = 'flex';
}

// Function to save PPA - make it global for onclick access
window.savePPA = function() {
    // Empêcher les soumissions multiples
    if (isSavingPPA) {
        console.log("Évite soumission multiple");
        return;
    }
    
    isSavingPPA = true;
    
    const ppaId = document.getElementById('editPPAId').textContent;
    const isNew = ppaId === 'Nouveau';
    
    // Get form values
    const personne_concernee = document.getElementById('editPPAPersonne').value;
    const heure = document.getElementById('editPPAHeure').value;
    const test_psychologique = document.getElementById('editPPATestPsy').value;
    const date_test_psy = document.getElementById('editPPADateTestPsy').value; 
    const matricule_agent = document.getElementById('editPPAMatricule').value;
    const modele_arme = document.getElementById('editPPAModeleArme').value;
    const nombre_munitions = parseInt(document.getElementById('editPPAMunitions').value) || 0;
    const casier_id = parseInt(document.getElementById('editPPACasier').value) || null;
    
    // Validate required fields
    if (!matricule_agent) {
        showNotification('Le matricule de l\'agent est obligatoire', 'error');
        isSavingPPA = false;
        return;
    }
    
    if (!modele_arme) {
        showNotification('Le modèle de l\'arme est obligatoire', 'error');
        isSavingPPA = false;
        return;
    }
    
    // Create PPA object
    const ppaData = {
        personne_concernee: personne_concernee,
        heure: heure,
        test_psychologique: test_psychologique,
        date_test_psy: date_test_psy,
        matricule_agent: matricule_agent,
        modele_arme: modele_arme,
        nombre_munitions: nombre_munitions,
        casier_id: casier_id
    };
    
    console.log("Sending PPA data:", ppaData);
    
    // Désactiver le bouton de sauvegarde pendant la requête
    const saveButton = document.getElementById('savePPABtn');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.classList.add('opacity-50');
    }
    
    // Send to API
    if (isNew) {
        fetch('/api/ppas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ppaData)
        })
        .then(response => response.json())
        .then(data => {
            // Add to local list without refresh
            ppas.push(data);
            
            showNotification('PPA créé avec succès', 'success');
            renderPPAsList();
            document.getElementById('editPPAModal').style.display = 'none';
            
            // Réinitialiser les variables de contrôle
            isSavingPPA = false;
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.classList.remove('opacity-50');
            }
        })
        .catch(error => {
            console.error('Error creating PPA:', error);
            showNotification('Erreur lors de la création du PPA', 'error');
            
            // Réinitialiser les variables de contrôle
            isSavingPPA = false;
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.classList.remove('opacity-50');
            }
        });
    } else {
        // Update existing PPA
        fetch(`/api/ppas/${ppaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ppaData)
        })
        .then(response => response.json())
        .then(data => {
            // Update in local list
            const index = ppas.findIndex(p => p.id === ppaId);
            if (index !== -1) {
                ppas[index] = data;
            }
            
            showNotification('PPA mis à jour avec succès', 'success');
            renderPPAsList();
            document.getElementById('editPPAModal').style.display = 'none';
            
            // Réinitialiser les variables de contrôle
            isSavingPPA = false;
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.classList.remove('opacity-50');
            }
        })
        .catch(error => {
            console.error('Error updating PPA:', error);
            showNotification('Erreur lors de la mise à jour du PPA', 'error');
            
            // Réinitialiser les variables de contrôle
            isSavingPPA = false;
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.classList.remove('opacity-50');
            }
        });
    }
}

// Fonction pour supprimer un PPA
window.deletePPA = function(ppaId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce PPA ?')) {
        return;
    }
    
    fetch(`/api/ppas/${ppaId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression');
        }
        return response.json();
    })
    .then(data => {
        // Supprimer le PPA de la liste locale
        ppas = ppas.filter(p => p.id !== ppaId);
        
        // Rafraîchir l'affichage
        renderPPAsList();
        
        // Afficher un message de succès
        showNotification('PPA supprimé avec succès', 'success');
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la suppression du PPA', 'error');
    });
};

// Function to render PPAs list
function renderPPAsList() {
    const ppaList = document.getElementById('ppaList');
    if (!ppaList) return;
    
    if (ppas.length === 0) {
        ppaList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="ri-shield-check-line text-4xl mb-2"></i>
                <p>Aucun PPA trouvé</p>
                <button class="mt-4 px-4 py-2 bg-primary text-white rounded-button text-sm" onclick="openEditPPAModal()">
                    Créer un PPA
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    ppas.forEach(ppa => {
        // Déterminer la couleur de statut
        let statusBadge;
        switch(ppa.test_psychologique) {
            case 'valide':
                statusBadge = `<span class="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Validé</span>`;
                break;
            case 'refuse':
                statusBadge = `<span class="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Refusé</span>`;
                break;
            default:
                statusBadge = `<span class="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">En attente</span>`;
        }
        
        html += `
            <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold">${ppa.code} - ${ppa.modele_arme}</h3>
                        <p class="text-sm text-gray-500">Casier: ${ppa.casier_nom || 'Non associé'}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="p-2 text-gray-500 hover:text-primary" onclick="openEditPPAModal(${ppa.id})">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="p-2 text-gray-500 hover:text-red-500" onclick="deletePPA(${ppa.id})">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-2">
                    <div class="text-sm text-gray-700">
                        <span class="font-medium">Personne:</span> ${ppa.personne_concernee || 'Non spécifiée'}
                    </div>
                    <div class="text-sm text-gray-700">
                        <span class="font-medium">Date test psy:</span> ${ppa.date_test_psy || 'Non spécifiée'}
                    </div>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-100">
                    <div class="flex items-center justify-between mb-2">
                        <div class="text-sm">
                            <span class="font-medium">Agent:</span> ${ppa.matricule_agent}
                        </div>
                        <div class="text-sm">
                            <span class="font-medium">Munitions:</span> ${ppa.nombre_munitions}
                        </div>
                    </div>
                    <div class="flex justify-between mt-2 items-center">
                        <span class="text-xs text-gray-500">Heure: ${ppa.heure || 'Non spécifiée'}</span>
                        ${statusBadge}
                    </div>
                </div>
            </div>
        `;
    });
    
    ppaList.innerHTML = html;
}

// When the PPA tab is activated
document.addEventListener('tabChanged', function(e) {
    if (e.detail.tab === 'ppa') {
        fetchPPAs();
        setupPPAEventListeners();
    }
});

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    setupPPAEventListeners();
});