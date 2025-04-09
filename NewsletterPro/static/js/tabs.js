// Tabs functionality
// Make it global so it can be accessed from other files
window.changeTab = function(tabId) {
    // Hide all content
    const contentSections = document.querySelectorAll('[id$="-content"]');
    contentSections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('[id$="-tab"]');
    tabs.forEach(tab => {
        tab.classList.remove('tab-active');
    });
    
    // Show selected content
    const selectedContent = document.getElementById(`${tabId}-content`);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    
    // Add active class to selected tab
    const selectedTab = document.getElementById(`${tabId}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('tab-active');
    }
    
    // Rafraîchir les données selon l'onglet actif
    if (tabId === 'rapports') {
        if (typeof renderRapportsList === 'function') {
            // Forcer un rendu des rapports existants
            renderRapportsList();
        }
        if (typeof fetchRapports === 'function') {
            // Rafraîchir les rapports depuis le serveur (sauf si on vient d'en créer un)
            fetchRapports();
        }
    } else if (tabId === 'amendes') {
        if (typeof fetchAmendes === 'function') {
            // Rafraîchir les amendes
            fetchAmendes();
        }
    } else if (tabId === 'casiers') {
        if (typeof renderCasiersList === 'function') {
            // Rafraîchir les casiers
            renderCasiersList();
        }
    } else if (tabId === 'ppa') {
        if (typeof fetchPPAs === 'function') {
            // Rafraîchir les PPAs
            fetchPPAs();
        }
    }
    
    // Dispatch a tab change event for other scripts to listen to
    document.dispatchEvent(new CustomEvent('tabChanged', { 
        detail: { tab: tabId }
    }));
}

// Add search functionality for casiers
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchCasier');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                // If search is empty, just show all casiers
                renderCasiersList();
                return;
            }
            
            // Filter casiers by search term
            const filteredCasiers = casiers.filter(casier => {
                return (
                    casier.nom.toLowerCase().includes(searchTerm) ||
                    (casier.profession && casier.profession.toLowerCase().includes(searchTerm)) ||
                    (casier.adresse && casier.adresse.toLowerCase().includes(searchTerm)) ||
                    (casier.telephone && casier.telephone.toLowerCase().includes(searchTerm)) ||
                    (casier.peine && casier.peine.toLowerCase().includes(searchTerm))
                );
            });
            
            // Render filtered casiers
            renderFilteredCasiers(filteredCasiers);
        });
    }
});

// Function to render filtered casiers
function renderFilteredCasiers(filteredCasiers) {
    const casiersList = document.getElementById('casiersList');
    if (!casiersList) return;
    
    if (filteredCasiers.length === 0) {
        casiersList.innerHTML = `
            <div class="md:col-span-3 text-center py-8 text-gray-500">
                <i class="ri-search-line text-4xl mb-2"></i>
                <p>Aucun résultat trouvé</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    filteredCasiers.forEach(casier => {
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