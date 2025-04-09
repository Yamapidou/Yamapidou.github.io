// Casier management functions

// Sample data structure for casiers (would be replaced with backend data)
let casiers = [
    {
        id: "C-001",
        nom: "Jean Dupont",
        telephone: "555-123-4567",
        profession: "Chauffeur",
        naissance: "1985-06-15",
        adresse: "123 Rue de la Liberté, Los Santos",
        peine: "Excès de vitesse - 3 points, 150€ d'amende",
        photo: null
    }
];

// Initialize casier functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup edit casier modal functionality if it exists
    const editCasierModal = document.getElementById('editCasierModal');
    if (editCasierModal) {
        setupCasierEventListeners();
    }
});

// Setup casier event listeners
function setupCasierEventListeners() {
    // Close button for modal
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            document.getElementById('editCasierModal').classList.add('hidden');
        });
    }
    
    // Save button functionality
    const saveCasierBtn = document.getElementById('saveCasierBtn');
    if (saveCasierBtn) {
        saveCasierBtn.addEventListener('click', function() {
            saveCasier();
        });
    }
    
    // Handle keyboard events for the modal
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('editCasierModal');
            if (modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        }
    });
}

// Function to open edit casier modal
function openEditCasierModal(casierId = null) {
    const isNew = casierId === null;
    
    // Set modal title
    document.getElementById('editCasierId').textContent = isNew ? 'Nouveau' : casierId;
    
    // Clear form or populate with existing data
    if (isNew) {
        document.getElementById('editCasierNom').value = '';
        document.getElementById('editCasierTelephone').value = '';
        document.getElementById('editCasierProfession').value = '';
        document.getElementById('editCasierNaissance').value = '';
        document.getElementById('editCasierAdresse').value = '';
        document.getElementById('editCasierPeine').value = '';
        
        // Reset photo preview
        const photoPreview = document.getElementById('photoPreview');
        photoPreview.innerHTML = '<div class="w-20 h-20 flex items-center justify-center"><i class="ri-user-fill ri-xl text-gray-400"></i></div>';
    } else {
        // Find casier by ID
        const casier = casiers.find(c => c.id === casierId);
        if (casier) {
            document.getElementById('editCasierNom').value = casier.nom;
            document.getElementById('editCasierTelephone').value = casier.telephone;
            document.getElementById('editCasierProfession').value = casier.profession;
            document.getElementById('editCasierNaissance').value = casier.naissance;
            document.getElementById('editCasierAdresse').value = casier.adresse;
            document.getElementById('editCasierPeine').value = casier.peine;
            
            // Set photo if exists
            const photoPreview = document.getElementById('photoPreview');
            if (casier.photo) {
                photoPreview.innerHTML = `<img src="${casier.photo}" alt="Photo" class="w-full h-full object-cover">`;
            } else {
                photoPreview.innerHTML = '<div class="w-20 h-20 flex items-center justify-center"><i class="ri-user-fill ri-xl text-gray-400"></i></div>';
            }
        }
    }
    
    // Show modal
    document.getElementById('editCasierModal').classList.remove('hidden');
}

// Function to handle photo upload
function handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            showNotification('Veuillez sélectionner une image valide', 'error');
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('L\'image est trop volumineuse (max 5MB)', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoPreview = document.getElementById('photoPreview');
            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Photo" class="w-full h-full object-cover">`;
            
            // Add remove button if not exists
            if (!document.getElementById('removePhotoBtn')) {
                const removeBtn = document.createElement('button');
                removeBtn.id = 'removePhotoBtn';
                removeBtn.className = 'px-3 py-1.5 border border-gray-300 rounded-button text-sm whitespace-nowrap flex items-center gap-1 hover:bg-gray-50 transition-all active:scale-95 text-red-500';
                removeBtn.innerHTML = '<div class="w-4 h-4 flex items-center justify-center"><i class="ri-delete-bin-line"></i></div>Supprimer';
                removeBtn.onclick = function() {
                    removePhoto();
                };
                
                // Get the upload button's parent and append the remove button
                const uploadBtnParent = document.getElementById('uploadPhotoBtn').parentElement;
                uploadBtnParent.appendChild(removeBtn);
            }
        };
        reader.readAsDataURL(file);
    }
}

// Function to remove photo
function removePhoto() {
    const photoPreview = document.getElementById('photoPreview');
    photoPreview.innerHTML = '<div class="w-20 h-20 flex items-center justify-center"><i class="ri-user-fill ri-xl text-gray-400"></i></div>';
    
    // Remove the remove button
    const removeBtn = document.getElementById('removePhotoBtn');
    if (removeBtn) {
        removeBtn.parentElement.removeChild(removeBtn);
    }
    
    // Clear the file input
    document.getElementById('photoInput').value = '';
}

// Function to save casier
function saveCasier() {
    const casierId = document.getElementById('editCasierId').textContent;
    const isNew = casierId === 'Nouveau';
    
    // Get form values
    const nom = document.getElementById('editCasierNom').value;
    const telephone = document.getElementById('editCasierTelephone').value;
    const profession = document.getElementById('editCasierProfession').value;
    const naissance = document.getElementById('editCasierNaissance').value;
    const adresse = document.getElementById('editCasierAdresse').value;
    const peine = document.getElementById('editCasierPeine').value;
    
    // Validate required fields
    if (!nom) {
        showNotification('Le nom est obligatoire', 'error');
        return;
    }
    
    // Get photo if exists
    let photo = null;
    const photoPreview = document.getElementById('photoPreview');
    const photoImg = photoPreview.querySelector('img');
    if (photoImg) {
        photo = photoImg.src;
    }
    
    // Create or update casier
    if (isNew) {
        // Generate new ID
        const newId = 'C-' + String(casiers.length + 1).padStart(3, '0');
        
        // Add new casier
        casiers.push({
            id: newId,
            nom,
            telephone,
            profession,
            naissance,
            adresse,
            peine,
            photo
        });
        
        showNotification('Casier créé avec succès', 'success');
    } else {
        // Update existing casier
        const index = casiers.findIndex(c => c.id === casierId);
        if (index !== -1) {
            casiers[index] = {
                ...casiers[index],
                nom,
                telephone,
                profession,
                naissance,
                adresse,
                peine,
                photo
            };
            
            showNotification('Casier mis à jour avec succès', 'success');
        }
    }
    
    // Close modal
    document.getElementById('editCasierModal').classList.add('hidden');
    
    // Refresh casier list if it exists
    if (document.getElementById('casiersList')) {
        renderCasiersList();
    }
}

// Function to render casiers list
function renderCasiersList() {
    const casiersList = document.getElementById('casiersList');
    if (!casiersList) return;
    
    if (casiers.length === 0) {
        casiersList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="ri-file-list-3-line text-4xl mb-2"></i>
                <p>Aucun casier trouvé</p>
                <button class="mt-4 px-4 py-2 bg-primary text-white rounded-button text-sm" onclick="openEditCasierModal()">
                    Créer un casier
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    casiers.forEach(casier => {
        html += `
            <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        ${casier.photo 
                            ? `<img src="${casier.photo}" alt="${casier.nom}" class="w-full h-full object-cover">`
                            : `<div class="w-12 h-12 flex items-center justify-center"><i class="ri-user-fill text-gray-400"></i></div>`
                        }
                    </div>
                    <div class="flex-grow">
                        <h3 class="font-semibold">${casier.nom}</h3>
                        <p class="text-sm text-gray-500">${casier.profession || 'Non spécifié'}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="p-2 text-gray-500 hover:text-primary" onclick="openEditCasierModal('${casier.id}')">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="p-2 text-gray-500 hover:text-red-500" onclick="deleteCasier('${casier.id}')">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    casiersList.innerHTML = html;
}

// Function to delete casier
function deleteCasier(casierId) {
    // Show confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]';
    confirmDialog.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fade-in">
            <div class="p-6 border-b">
                <h3 class="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
            </div>
            <div class="p-6">
                <p class="text-gray-600">Êtes-vous sûr de vouloir supprimer ce casier ? Cette action est irréversible.</p>
            </div>
            <div class="p-4 bg-gray-50 flex justify-end gap-3">
                <button id="cancelDeleteBtn" class="px-4 py-2 border border-gray-300 rounded-button text-sm whitespace-nowrap">
                    Annuler
                </button>
                <button id="confirmDeleteBtn" class="px-4 py-2 bg-red-500 text-white rounded-button text-sm whitespace-nowrap">
                    Supprimer
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmDialog);
    
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
        document.body.removeChild(confirmDialog);
    });
    
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        // Remove casier from array
        casiers = casiers.filter(c => c.id !== casierId);
        
        // Hide confirmation dialog
        document.body.removeChild(confirmDialog);
        
        // Show success notification
        showNotification('Casier supprimé avec succès', 'success');
        
        // Refresh list
        renderCasiersList();
    });
}
