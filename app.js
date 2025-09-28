// Main Application Controller
const App = {
    init: () => {
        // Check if user is already logged in
        if (Auth.isLoggedIn()) {
            App.initApp();
        } else {
            // Show splash screen first, then login
            setTimeout(() => {
                Utils.showScreen('login-screen');
            }, 2000);
        }

        App.setupEventListeners();
    },

    initApp: () => {
        // Load user data from currentUser (not userData)
        const userData = Auth.getCurrentUser();
        if (userData) {
            document.getElementById('user-name').textContent = userData.name;
            document.getElementById('user-phone').textContent = `+91-${userData.mobile_number}`;
        }

        // Load initial data
        Products.fetchAll();
        
        // Initialize cart
        Cart.init();
        
        // Show app container
        Utils.showScreen('app-container');
    },

    setupEventListeners: () => {
        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const mobile = document.getElementById('mobile').value;
            const password = document.getElementById('password').value;

            try {
                const user = await Auth.login(mobile, password);
                if (user) {
                    App.initApp();
                }
            } catch (error) {
                Utils.showNotification(error.message, 'error');
            }
        });

        // Registration form
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('reg-name').value.trim(),
                email: document.getElementById('reg-email').value.trim(),
                mobile_number: document.getElementById('reg-mobile').value.trim(),
                address: document.getElementById('reg-address').value.trim(),
                password: document.getElementById('reg-password').value,
                confirm_password: document.getElementById('reg-confirm-password').value
            };

            try {
                const user = await Auth.register(formData);
                if (user) {
                    // Auto-login after successful registration
                    App.initApp();
                }
            } catch (error) {
                Utils.showNotification(error.message, 'error');
            }
        });

        // Real-time validation for registration form
        App.setupRegistrationValidation();

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (link.id === 'logout-btn') {
                    if (confirm('Are you sure you want to logout?')) {
                        Auth.logout();
                    }
                } else {
                    const page = link.dataset.page;
                    App.showPage(page);
                }
            });
        });

        // Menu toggle
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('nav-drawer').classList.toggle('open');
        });

        // Category dropdown
        document.getElementById('category-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('category-options').classList.toggle('show');
        });

        // Sort dropdown
        document.getElementById('sort-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('sort-options').classList.toggle('show');
        });

        // Category selection
        document.querySelectorAll('#category-options a').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const category = option.dataset.category;
                Products.fetchAll(category);
                document.getElementById('category-options').classList.remove('show');
                document.getElementById('page-title').textContent = 
                    category === 'all' ? 'All Products' : 
                    category.charAt(0).toUpperCase() + category.slice(1);
            });
        });

        // Sort selection
        document.querySelectorAll('#sort-options a').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                Products.sortProducts(option.dataset.sort);
                document.getElementById('sort-options').classList.remove('show');
            });
        });

        // Search functionality
        document.getElementById('search-btn').addEventListener('click', () => {
            const searchTerm = document.getElementById('search-input').value;
            Products.searchProducts(searchTerm);
        });

        // Enter key in search
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = document.getElementById('search-input').value;
                Products.searchProducts(searchTerm);
            }
        });

        // Cart button
        document.getElementById('cart-button').addEventListener('click', () => {
            Cart.displayCart();
            App.showPage('cart');
        });

        // Form navigation links
        document.getElementById('register-link').addEventListener('click', (e) => {
            e.preventDefault();
            Utils.showScreen('register-screen');
        });

        document.getElementById('back-to-login').addEventListener('click', (e) => {
            e.preventDefault();
            Utils.showScreen('login-screen');
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.getElementById('category-options').classList.remove('show');
            document.getElementById('sort-options').classList.remove('show');
        });

        // Close navigation when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-drawer') && !e.target.closest('#menu-toggle')) {
                document.getElementById('nav-drawer').classList.remove('open');
            }
        });

        // Modal functionality
        App.setupModalListeners();
    },

    // Setup real-time validation for registration form
    setupRegistrationValidation: () => {
        const mobileInput = document.getElementById('reg-mobile');
        const emailInput = document.getElementById('reg-email');
        const passwordInput = document.getElementById('reg-password');
        const confirmPasswordInput = document.getElementById('reg-confirm-password');

        // Mobile number validation
        mobileInput.addEventListener('blur', () => {
            const mobile = mobileInput.value.trim();
            if (mobile && !Utils.validateMobile(mobile)) {
                App.showFieldError(mobileInput, 'Please enter a valid 10-digit mobile number');
            } else if (mobile && Auth.isMobileRegistered(mobile)) {
                App.showFieldError(mobileInput, 'Mobile number already registered');
            } else {
                App.clearFieldError(mobileInput);
            }
        });

        // Email validation
        emailInput.addEventListener('blur', () => {
            const email = emailInput.value.trim();
            if (email && !Utils.validateEmail(email)) {
                App.showFieldError(emailInput, 'Please enter a valid email address');
            } else if (email && Auth.isEmailRegistered(email)) {
                App.showFieldError(emailInput, 'Email already registered');
            } else {
                App.clearFieldError(emailInput);
            }
        });

        // Password confirmation
        confirmPasswordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (confirmPassword && password !== confirmPassword) {
                App.showFieldError(confirmPasswordInput, 'Passwords do not match');
            } else {
                App.clearFieldError(confirmPasswordInput);
            }
        });
    },

    // Show field error
    showFieldError: (input, message) => {
        App.clearFieldError(input);
        input.style.borderColor = '#e74c3c';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    },

    // Clear field error
    clearFieldError: (input) => {
        input.style.borderColor = '';
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    },

    showPage: (page) => {
        let pageId = `${page}-page`;
        
        switch (page) {
            case 'profile':
                Products.loadUserProfile();
                break;
            case 'faqs':
                Products.loadFAQs();
                break;
            case 'home':
                Products.fetchAll();
                break;
            case 'categories':
                Products.loadCategories();
                break;
            case 'wishlist':
                Products.loadWishlist();
                break;
            case 'orders':
                Products.loadOrderHistory();
                break;
            case 'cart':
                Cart.displayCart();
                break;
        }
        
        Utils.showPage(pageId);
    },

    setupModalListeners: () => {
        // Forgot password link
        document.getElementById('forgot-password-link').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('forgot-password-modal').style.display = 'block';
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.modal').style.display = 'none';
                
                // Clear modal forms when closed
                if (button.closest('#forgot-password-modal')) {
                    document.getElementById('forgot-password-form').reset();
                }
                if (button.closest('#reset-password-modal')) {
                    document.getElementById('reset-password-form').reset();
                }
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                
                // Clear modal forms when closed
                if (e.target.id === 'forgot-password-modal') {
                    document.getElementById('forgot-password-form').reset();
                }
                if (e.target.id === 'reset-password-modal') {
                    document.getElementById('reset-password-form').reset();
                }
            }
        });

        // Forgot password form
        document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const mobile = document.getElementById('reset-mobile').value;
            const email = document.getElementById('reset-email').value;

            try {
                await Auth.forgotPassword(mobile, email);
                document.getElementById('forgot-password-modal').style.display = 'none';
                document.getElementById('reset-password-modal').style.display = 'block';
                
                // Clear the forgot password form
                document.getElementById('forgot-password-form').reset();
                
            } catch (error) {
                Utils.showNotification(error.message, 'error');
            }
        });

        // Reset password form
        document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const otp = document.getElementById('otp').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmNewPassword = document.getElementById('confirm-new-password').value;

            try {
                await Auth.resetPassword(otp, newPassword, confirmNewPassword);
                document.getElementById('reset-password-modal').style.display = 'none';
                
                // Clear the reset password form
                document.getElementById('reset-password-form').reset();
                
                // Navigate to login screen after successful reset
                setTimeout(() => {
                    Utils.showScreen('login-screen');
                }, 1000);
                
            } catch (error) {
                Utils.showNotification(error.message, 'error');
            }
        });
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', App.init);

// Global function to show pages (for onclick events)
function showPage(page) {
    App.showPage(page);
}