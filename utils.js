// API Configuration
const API_BASE = 'http://13.235.250.119/v2';

// Utility Functions
const Utils = {
    // Screen Management
    showScreen: (screenId) => {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const screenElement = document.getElementById(screenId);
        if (screenElement) {
            screenElement.classList.add('active');
        }
    },

    // Page Management
    showPage: (pageId) => {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        const pageElement = document.getElementById(pageId);
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const navLink = document.querySelector(`[data-page="${pageId.replace('-page', '')}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
        
        // Update page title
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            const title = pageId.replace('-page', '').split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            pageTitle.textContent = title;
        }
        
        // Close navigation drawer on mobile
        document.getElementById('nav-drawer').classList.remove('open');
    },

    // API Call Helper
    apiCall: async (endpoint, options = {}) => {
        try {
            const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('authToken') || ''
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    },

    // Validation Functions
    validateMobile: (mobile) => /^\d{10}$/.test(mobile),
    validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

    // Notification System
    showNotification: (message, type = 'info') => {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    },

    // Format Currency
    formatCurrency: (amount) => {
        return `₹${parseInt(amount).toLocaleString('en-IN')}`;
    },

    // Calculate Discount Percentage
    calculateDiscount: (originalPrice, sellingPrice) => {
        const discount = ((originalPrice - sellingPrice) / originalPrice) * 100;
        return Math.round(discount);
    },

    // Debounce Function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Generate Random ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Format Date
    formatDate: (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    }
};