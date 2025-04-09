// Authentication functions
document.addEventListener('DOMContentLoaded', function() {
    // Show login modal by default
    document.getElementById('loginModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    
    togglePassword.addEventListener('click', function() {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        // Toggle icon
        const icon = this.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('ri-eye-line');
            icon.classList.add('ri-eye-off-line');
        } else {
            icon.classList.remove('ri-eye-off-line');
            icon.classList.add('ri-eye-line');
        }
    });
    
    // Handle remember me checkbox
    document.getElementById('remember').addEventListener('change', function() {
        handleRememberChange(this);
    });
    
    // Load saved credentials if they exist
    const savedCredentials = localStorage.getItem('credentials');
    if (savedCredentials) {
        try {
            const credentials = JSON.parse(atob(savedCredentials));
            document.getElementById('username').value = credentials.username;
            document.getElementById('password').value = credentials.password;
            document.getElementById('remember').checked = true;
        } catch (e) {
            console.error('Error parsing saved credentials');
        }
    }
    
    // Handle login button click
    document.getElementById('loginBtn').addEventListener('click', function() {
        handleLogin();
    });
    
    // Handle Enter key press in login form
    const username = document.getElementById('username');
    const passwordField = document.getElementById('password');
    
    [username, passwordField].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('loginBtn').click();
            }
        });
    });
});

// Function to handle "Remember me" checkbox change
function handleRememberChange(checkbox) {
    if (checkbox.checked) {
        const warningDialog = document.createElement('div');
        warningDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]';
        warningDialog.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div class="p-6 border-b">
                <h3 class="text-lg font-semibold text-amber-600">Avertissement de sécurité</h3>
            </div>
            <div class="p-6">
                <div class="flex items-start gap-3">
                    <div class="w-5 h-5 flex items-center justify-center text-amber-500">
                        <i class="ri-alert-line text-xl mt-0.5"></i>
                    </div>
                    <div>
                        <p class="text-gray-600 mb-3">En activant cette option, vos identifiants de connexion seront enregistrés sur cet appareil.</p>
                        <p class="text-gray-600 mb-3">Cette fonctionnalité n'est pas recommandée sur un ordinateur partagé ou public pour des raisons de sécurité.</p>
                        <p class="text-gray-600">Souhaitez-vous continuer ?</p>
                    </div>
                </div>
            </div>
            <div class="p-4 bg-gray-50 flex justify-end gap-3">
                <button id="cancelRememberBtn" class="px-4 py-2 border border-gray-300 rounded-button text-sm whitespace-nowrap">
                    Annuler
                </button>
                <button id="confirmRememberBtn" class="px-4 py-2 bg-primary text-white rounded-button text-sm whitespace-nowrap">
                    Continuer
                </button>
            </div>
        </div>
        `;
        document.body.appendChild(warningDialog);
        
        document.getElementById('cancelRememberBtn').addEventListener('click', function() {
            checkbox.checked = false;
            document.body.removeChild(warningDialog);
        });
        
        document.getElementById('confirmRememberBtn').addEventListener('click', function() {
            document.body.removeChild(warningDialog);
        });
    }
}

// Function to handle login process
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const loginBtn = document.getElementById('loginBtn');
    
    if (!username || !password) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    // Store credentials if remember me is checked
    if (remember) {
        const credentials = btoa(JSON.stringify({
            username: username,
            password: password
        }));
        localStorage.setItem('credentials', credentials);
    } else {
        localStorage.removeItem('credentials');
    }
    
    // Show loading state
    const originalContent = loginBtn.innerHTML;
    loginBtn.innerHTML = `
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Connexion...</span>
    `;
    loginBtn.disabled = true;
    
    // Simulate authentication (replace with real authentication)
    setTimeout(() => {
        // For demo, accept any non-empty credentials
        if (username && password) {
            document.getElementById('loginModal').classList.add('hidden');
            document.body.style.overflow = '';
            showNotification('Connexion réussie', 'success');
            // Update current date
            updateCurrentDate();
        } else {
            showNotification('Identifiants invalides', 'error');
            loginBtn.innerHTML = originalContent;
            loginBtn.disabled = false;
        }
    }, 1000);
}

// Function to update current date
function updateCurrentDate() {
    const currentDateElement = document.getElementById('currentDate');
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    currentDateElement.textContent = `${day}/${month}/${year}`;
}
